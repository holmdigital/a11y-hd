import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTable } from './DataTable';
import type { Column } from './DataTable';

/**
 * UAT scaffold for Phase 30 (APG grid cell-wise keyboard navigation).
 *
 * 15 rows so PageUp/PageDown (PAGE_SIZE=10) jumps are observable, plus a
 * focusable input before and a button after the grid so Tab-in / Tab-out
 * roving-tabindex behaviour and the no-focus-steal-on-mount guard can be
 * verified manually.
 */

interface Person {
    name: string;
    city: string;
    role: string;
}

const CITIES = [
    'Stockholm',
    'Berlin',
    'Amsterdam',
    'Paris',
    'Madrid',
    'Lisbon',
    'Warsaw',
    'Helsinki',
    'Oslo',
    'Copenhagen',
    'Dublin',
    'Vienna',
    'Brussels',
    'Rome',
    'Prague',
];

const ROLES = ['Admin', 'Editor', 'Viewer'];

const people: Person[] = Array.from({ length: 15 }, (_, i) => ({
    name: `User${String(i + 1).padStart(2, '0')}`,
    city: CITIES[i % CITIES.length],
    role: ROLES[i % ROLES.length],
}));

const columns: Column<Person>[] = [
    { header: 'Name', accessor: 'name', sortable: true },
    { header: 'City', accessor: 'city', sortable: true },
    { header: 'Role', accessor: 'role' },
];

const meta: Meta<typeof DataTable> = {
    title: 'Components/DataTable',
    component: DataTable,
};

export default meta;

export const APGGridKeyboard: StoryObj<typeof DataTable> = {
    render: () => (
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '48rem' }}>
            <label>
                Focusable element before the grid:{' '}
                <input type="text" placeholder="Tab from here into the grid" />
            </label>
            <DataTable<Person>
                data={people}
                columns={columns}
                caption="Team roster — 15 rows for APG grid keyboard UAT (Phase 30)"
            />
            <button type="button">Focusable element after the grid</button>
        </div>
    ),
};
