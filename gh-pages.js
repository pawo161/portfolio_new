import { publish } from 'gh-pages';

publish('build', {
        branch: 'gh-pages',
        repo: 'https://github.com/pawo161/portfolio_new.git',
        dotfiles: true,
        user: {
            name: 'pawo161',
            email: 'pawo161@gmail.com'
        }
    },
    () => { console.log('Github Page Deployed') }
);