// Site-wide settings used by the build script and the data updater.
export const SITE = {
  name: 'Hello.Green',
  domain: 'https://hello.green',
  tagline: 'Lower bills. Lower carbon. Real numbers for your home.',
  adsenseClient: 'ca-pub-6620975821265271',
  // The only external contact link. Its address is never printed as text.
  interestLink: 'https://web.works/contact',
  interestText: 'Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership',
  lastChecked: '19 November 2026',
  year: 2026
};

export const NAV = [
  { href: 'tools/', label: 'Tools', section: 'tools' },
  { href: 'guides/', label: 'Guides', section: 'guides' },
  { href: 'incentives.html', label: 'Incentives', section: 'incentives' },
  { href: 'news.html', label: 'News', section: 'news' },
  { href: 'videos.html', label: 'Videos', section: 'videos' },
  { href: 'planet.html', label: 'Planet Pulse', section: 'planet' }
];

export const INVOLVED = [
  { href: 'support.html', label: 'Support Hello.Green', note: 'Fund tools, guides and prizes' },
  { href: 'contests.html', label: 'Contests', note: 'Enter and win green prizes' },
  { href: 'challenge.html', label: '30-day challenge', note: 'One small change a day' },
  { href: 'careers.html', label: 'Careers', note: 'Write, film, build, sell' },
  { href: 'advertise.html', label: 'Advertise & sponsor', note: 'Reach green homeowners' },
  { href: 'pros.html', label: 'For installers', note: 'Get qualified leads' }
];

export const TOOLS = [
  { href: 'tools/solar-savings.html', label: 'Solar savings calculator', note: 'System size, cost, payback and 25-year savings' },
  { href: 'tools/carbon-footprint.html', label: 'Carbon footprint calculator', note: 'Your tonnes per year, compared with your country' },
  { href: 'tools/heat-pump-savings.html', label: 'Heat pump savings', note: 'What switching from gas, oil or propane costs and saves' },
  { href: 'tools/ev-vs-gas.html', label: 'EV vs gas cost', note: 'Fuel, charging and CO₂ side by side' },
  { href: 'tools/home-energy.html', label: 'Home energy quick wins', note: 'LEDs, standby power, thermostat and hot water' },
  { href: 'tools/recycling-sorter.html', label: 'Recycling sorter', note: 'Which bin does it go in?' },
  { href: 'tools/green-quiz.html', label: 'Green Score quiz', note: '10 questions, one honest score' }
];
