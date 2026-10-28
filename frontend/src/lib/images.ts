// Free-to-use medical and care photographs from Unsplash. Replace with licensed brand photography before a public launch.
const u = (id: string, w = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMG = {
  doctorPatient: u("photo-1576091160399-112ba8d25d1d"),
  consult: u("photo-1559757148-5c350d0d3c56"),
  elderChild: u("photo-1511895426328-dc8714191300"),
  chart: u("photo-1559757175-0eb30cd8c063"),
  laptop: u("photo-1576091160550-2173dba999ef"),
  lobby: u("photo-1519494026892-80bbd2d6fd0d"),
  building: u("photo-1586773860418-d37222d8fce3"),
  clinicBuilding: u("photo-1587351021759-3e566b6af7cc"),
  ward: u("photo-1538108149393-fbbd81895907"),
  surgery: u("photo-1551076805-e1869033e561"),
  office: u("photo-1497366811353-6870744d04b2"),
  counter: u("photo-1576091160399-112ba8d25d1d"),
  // Patient portal
  doctorPortrait: u("photo-1612349317150-e413f6a5b16d"),
  family: u("photo-1609220136736-443140cffec6"),
  bedside: u("photo-1584516150909-c43483ee7932"),
  checkup: u("photo-1631815589968-fdb09a223b1e"),
  doctorPhone: u("photo-1576091160399-112ba8d25d1d"),
  careHands: u("photo-1604881991720-f91add269bed"),
  heartCare: u("photo-1624727828489-a1e03b79bba8"),
  nurse: u("photo-1594824476967-48c8b964273f"),
};
