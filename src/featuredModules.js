export default [
  {
    latest: true,
    fromWalletVersion: '3.1.0',
    modules: [
      {
        name: 'nexus-invoice',
        displayName: 'Nexus Invoice',
        description: 'Send, pay, and manage invoices on Nexus blockchain',
        type: 'app',
        icon: 'invoice.svg',
        repoInfo: {
          host: 'github.com',
          owner: 'Nexusoft',
          repo: 'nexus-invoice-module',
        },
        author: {
          name: 'Nexus Team',
          email: 'developer@nexus.io',
        },
      },
      {
        name: 'nexus-market-data',
        displayName: 'Market Data',
        description: 'Market Data of Nexus trading on major exchanges',
        type: 'app',
        icon: 'chart.svg',
        repoInfo: {
          host: 'github.com',
          owner: 'Nexusoft',
          repo: 'nexus-market-data-module',
        },
        author: {
          name: 'Nexus Team',
          email: 'developer@nexus.io',
        },
      },
    ],
  },
];
