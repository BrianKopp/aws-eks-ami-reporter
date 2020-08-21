module.exports = {
  title: 'AWS EKS AMI Reporter',
  tagline: 'Your hub for getting notified about new AWS EKS AMIs',
  url: 'https://awseksami.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'briankopp', // Usually your GitHub org/user name.
  projectName: 'aws-eks-ami-reporter', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'AWS EKS AMI',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          href: 'https://github.com/briankopp/aws-eks-ami-reporter',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: 'docs/',
            },
            {
              label: 'How it Works',
              to: 'docs/how-it-works'
            },
            {
              label: 'SNS Details',
              to: 'docs/sns-details',
            },
            {
              label: 'Supported Regions',
              to: 'docs/supported-regions'
            }
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Slack',
              href: 'https://kubernetes.slack.com/archives/C8SH2GSL9',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/briankopp/aws-eks-ami-reporter',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Brian Kopp.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: 'getting-started',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/briankopp/aws-eks-ami-reporter/tree/master/docs/site/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
