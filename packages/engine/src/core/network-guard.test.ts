/**
 * Intern #53 steg 2: motorns nätverksspärr.
 *
 * Testet som betyder något är inte att en publik adress släpps igenom, utan
 * att en intern INTE gör det: varken som startadress, som omdirigering eller
 * som resurs sidan hämtar, och inte heller när uppslaget misslyckas.
 */
import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import type { Page } from 'puppeteer';
import {
    blockedIPv4,
    blockedIPv6,
    blockedHostReason,
    assertPublicHost,
    guardPage,
    PrivateHostError,
} from './network-guard';

describe('blockedIPv4', () => {
    it.each([
        ['10.0.0.5', 'private 10.0.0.0/8'],
        ['127.0.0.1', 'loopback 127.0.0.0/8'],
        ['169.254.169.254', 'the cloud metadata service 169.254.169.254'],
        ['169.254.1.1', 'link-local 169.254.0.0/16'],
        ['172.16.0.1', 'private 172.16.0.0/12'],
        ['172.31.255.255', 'private 172.16.0.0/12'],
        ['192.168.1.1', 'private 192.168.0.0/16'],
        ['100.64.0.1', 'carrier-grade NAT 100.64.0.0/10'],
        ['0.0.0.0', 'this-network 0.0.0.0/8'],
        ['224.0.0.1', 'multicast or reserved 224.0.0.0/4'],
    ])('%s spärras som %s', (ip, reason) => {
        expect(blockedIPv4(ip)).toBe(reason);
    });

    it.each(['8.8.8.8', '93.184.216.34', '172.32.0.1', '100.128.0.1', '192.169.0.1'])('%s är publik', (ip) => {
        expect(blockedIPv4(ip)).toBeNull();
    });
});

describe('blockedIPv6', () => {
    it.each(['::1', '::', 'fd00::1', 'fc00::1', 'fe80::1', 'ff02::1', '::ffff:10.0.0.5', '::ffff:169.254.169.254'])(
        '%s spärras', (ip) => {
            expect(blockedIPv6(ip)).not.toBeNull();
        }
    );

    it('2606:4700::1111 är publik', () => {
        expect(blockedIPv6('2606:4700::1111')).toBeNull();
    });
});

describe('blockedHostReason', () => {
    const resolver = (answer: Array<{ address: string; family: number }>) => vi.fn(async () => answer);

    it('ett namn som pekar på en intern adress spärras, inte bara adressen själv', async () => {
        expect(await blockedHostReason('intern.example.test', resolver([{ address: '10.0.0.5', family: 4 }])))
            .toBe('private 10.0.0.0/8');
    });

    it('ett namn med både publik och privat adress spärras', async () => {
        const answer = [{ address: '93.184.216.34', family: 4 }, { address: '192.168.0.10', family: 4 }];
        expect(await blockedHostReason('blandad.example.test', resolver(answer))).toBe('private 192.168.0.0/16');
    });

    it('ett uppslag som misslyckas spärras: grinden felar stängt', async () => {
        const failing = vi.fn(async () => { throw new Error('ENOTFOUND'); });
        expect(await blockedHostReason('finns-inte.example.test', failing)).toMatch(/fails closed/);
    });

    it('ett tomt svar spärras', async () => {
        expect(await blockedHostReason('tom.example.test', resolver([]))).toMatch(/fails closed/);
    });

    it('IP-litteraler prövas utan uppslag, också IPv6 inom hakparentes', async () => {
        const never = vi.fn(async () => { throw new Error('ska inte anropas'); });
        expect(await blockedHostReason('127.0.0.1', never)).toBe('loopback 127.0.0.0/8');
        expect(await blockedHostReason('[::1]', never)).toBe('loopback ::1');
        expect(never).not.toHaveBeenCalled();
    });

    it('ett namn som bara ger publika adresser släpps igenom', async () => {
        expect(await blockedHostReason('example.test', resolver([{ address: '93.184.216.34', family: 4 }]))).toBeNull();
    });
});

describe('assertPublicHost', () => {
    it('localhost spärras med ett besked om hur man öppnar spärren', async () => {
        const error = await assertPublicHost('http://localhost:3000/', async () => [{ address: '127.0.0.1', family: 4 }])
            .catch((e: unknown) => e);
        expect(error).toBeInstanceOf(PrivateHostError);
        expect((error as Error).message).toContain('--allow-private-hosts');
        expect((error as Error).message).toContain('loopback');
    });

    it('molnets metadatatjänst spärras även som litteral', async () => {
        await expect(assertPublicHost('http://169.254.169.254/latest/meta-data/')).rejects.toBeInstanceOf(PrivateHostError);
    });

    it('en publik adress släpps igenom', async () => {
        await expect(assertPublicHost('https://example.test/', async () => [{ address: '93.184.216.34', family: 4 }]))
            .resolves.toBeUndefined();
    });
});

/** En sida och förfrågningar som gör precis det spärren anropar. */
function fakePage() {
    const page = Object.assign(new EventEmitter(), {
        setRequestInterception: vi.fn(async () => {}),
    });
    const request = (url: string) => ({
        url: () => url,
        abort: vi.fn(async () => {}),
        continue: vi.fn(async () => {}),
    });
    return { page, request };
}

const settle = () => new Promise(resolve => setTimeout(resolve, 0));

describe('guardPage', () => {
    const resolver = vi.fn(async (host: string) =>
        host === 'intern.example.test' ? [{ address: '10.0.0.5', family: 4 }] : [{ address: '93.184.216.34', family: 4 }]
    );

    it('avbryter förfrågningar till interna adresser och släpper igenom publika', async () => {
        resolver.mockClear();
        const { page, request } = fakePage();
        const blocked = await guardPage(page as unknown as Page, resolver);
        expect(page.setRequestInterception).toHaveBeenCalledWith(true);

        const publik = request('https://example.test/style.css');
        const omdirigering = request('http://intern.example.test/admin');
        const metadata = request('http://169.254.169.254/latest/meta-data/');
        const inline = request('data:image/png;base64,AAAA');
        const fil = request('file:///etc/passwd');
        for (const r of [publik, omdirigering, metadata, inline, fil]) page.emit('request', r);
        await settle();
        await settle();

        expect(publik.continue).toHaveBeenCalledTimes(1);
        expect(inline.continue).toHaveBeenCalledTimes(1);
        for (const r of [omdirigering, metadata, fil]) {
            expect(r.abort).toHaveBeenCalledWith('blockedbyclient');
            expect(r.continue).not.toHaveBeenCalled();
        }
        // Förfrågningarna avslutas asynkront, så ordningen säger inget.
        expect(blocked().map(b => b.host).sort()).toEqual(['', '169.254.169.254', 'intern.example.test']);
        expect(blocked().find(b => b.host === '169.254.169.254')?.reason).toContain('metadata');
    });

    it('slår upp varje värdnamn en gång per sida', async () => {
        resolver.mockClear();
        const { page, request } = fakePage();
        await guardPage(page as unknown as Page, resolver);
        page.emit('request', request('https://example.test/a.js'));
        page.emit('request', request('https://example.test/b.js'));
        await settle();
        await settle();
        expect(resolver).toHaveBeenCalledTimes(1);
    });

    it('löser varje förfrågan exakt en gång även om den redan hunnit avslutas', async () => {
        const { page } = fakePage();
        await guardPage(page as unknown as Page, resolver);
        const redanKlar = {
            url: () => 'https://example.test/',
            abort: vi.fn(async () => {}),
            continue: vi.fn(async () => { throw new Error('Request is already handled!'); }),
        };
        page.emit('request', redanKlar);
        await settle();
        await settle();
        expect(redanKlar.continue).toHaveBeenCalledTimes(1);
        expect(redanKlar.abort).not.toHaveBeenCalled();
    });
});
