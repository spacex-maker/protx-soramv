import bostonDynamics from './bostonDynamics';
import figureAI from './figureAI';
import tesla from './tesla';
import agilityRobotics from './agilityRobotics';
import oneXTechnologies from './oneXTechnologies';
import unitree from './unitree';
import agibot from './agibot';
import ubtech from './ubtech';
import apptronik from './apptronik';
import sanctuaryAI from './sanctuaryAI';

const allCompanies = [
  bostonDynamics,
  figureAI,
  tesla,
  agilityRobotics,
  oneXTechnologies,
  unitree,
  agibot,
  ubtech,
  apptronik,
  sanctuaryAI,
];

const bySlug = {};
allCompanies.forEach((c) => {
  bySlug[c.slug] = c;
});

export { allCompanies, bySlug };
export default allCompanies;
