import { ArticleData } from '../types';
import { introArticle } from './articles/intro';
import { aboutArticle } from './articles/about';
import { philosophyArticle } from './articles/philosophy';
import { featuresArticle } from './articles/features';
import { installationArticle } from './articles/installation';
import { configArticle, cicdArticle } from './articles/config';
import { buttonsArticle } from './articles/components/buttons';
import { formsArticle } from './articles/components/forms';
import { modalsArticle } from './articles/components/modals';
import { standardsArticle } from './articles/standards';
import { structureArticle } from './articles/components/structure';
import { navigationArticle } from './articles/components/navigation';
import { feedbackArticle } from './articles/components/feedback';

export const ARTICLES: Record<string, ArticleData> = {
    'intro': introArticle,
    'about': aboutArticle,
    'philosophy': philosophyArticle,
    'features': featuresArticle,
    'installation': installationArticle,
    'config': configArticle,
    'ci-cd': cicdArticle,
    'buttons': buttonsArticle,
    'forms': formsArticle,
    'modals': modalsArticle,
    'standards': standardsArticle,
    'navigation': navigationArticle,
    'feedback': feedbackArticle,
    'content-structure': structureArticle,

    'getting-started': {
        id: 'getting-started',
        title: 'Getting Started',
        description: 'Start here to learn how to use the HolmDigital accessibility suite.',
        lastUpdated: 'December 08, 2025',
        sections: [],
        content: <p>Select a sub- topic from the sidebar to get started.</p>
    },
    'components': {
        id: 'components',
        title: 'Core Components',
        description: 'Accessible React components for your applications.',
        lastUpdated: 'December 08, 2025',
        sections: [],
        content: <p>Select a component from the sidebar to view its documentation.</p>
    }
};
