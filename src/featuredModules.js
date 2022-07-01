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
        icon: { name: 'invoice.svg', viewBox: '0 -18 416.212 416' },
        repoInfo: {
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
        icon: { name: 'chart.svg', viewBox: '0 0 486.742 486.742' },
        repoInfo: {
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
