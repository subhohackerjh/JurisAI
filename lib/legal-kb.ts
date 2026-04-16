import { IPCSection } from './types';

export const legalKnowledgeBase: IPCSection[] = [
  {
    number: '302',
    title: 'Punishment for Voluntarily Causing Hurt',
    description:
      'Whoever voluntarily causes hurt to any person shall be punished with imprisonment of either description for a term which may extend to six months, or with fine which may extend to two hundred and fifty rupees, or with both.',
    punishment: 'Imprisonment up to 6 months or fine up to ₹250 or both',
    keywords: ['hurt', 'voluntary', 'injury', 'assault'],
  },
  {
    number: '304A',
    title: 'Causing Death by Act Endangering Life or Personal Safety',
    description:
      'Whoever causes death by doing any rash or negligent act not amounting to culpable homicide shall be punished with imprisonment of either description for a term which may extend to two years, or with fine which may extend to one thousand rupees, or with both.',
    punishment: 'Imprisonment up to 2 years or fine up to ₹1000 or both',
    keywords: ['death', 'negligent', 'rash', 'accident', 'homicide'],
  },
  {
    number: '307',
    title: 'Attempt to Murder',
    description:
      'Whoever does any act with such intention or knowledge, and under such circumstances that, if he by that act caused death, he would be guilty of murder shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.',
    punishment: 'Imprisonment up to 10 years and fine',
    keywords: ['murder', 'attempt', 'intention', 'deadly', 'weapon'],
  },
  {
    number: '323',
    title: 'Punishment for Voluntarily Causing Hurt',
    description:
      'Whoever voluntarily causes hurt to any person shall be punished with imprisonment of either description for a term which may extend to three months or with fine which may extend to two hundred and fifty rupees or with both.',
    punishment: 'Imprisonment up to 3 months or fine up to ₹250 or both',
    keywords: ['hurt', 'injury', 'simple', 'assault'],
  },
  {
    number: '354',
    title: 'Assault or Criminal Force to Woman with Intent to Outrage Modesty',
    description:
      'Whoever assaults or uses criminal force to any woman, intending to outrage or knowing it to be likely that he will thereby outrage her modesty, shall be punished with imprisonment of either description for a term which may extend to two years, or with fine which may extend to one thousand rupees, or with both.',
    punishment: 'Imprisonment up to 2 years or fine up to ₹1000 or both',
    keywords: ['woman', 'assault', 'modesty', 'criminal force', 'protection'],
  },
  {
    number: '420',
    title: 'Cheating and Dishonestly Inducing Delivery of Property',
    description:
      'Whoever cheats and by virtue of his cheating dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or erase or alter, or cause to be erased or altered, any writing or electronic record containing a secret, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.',
    punishment: 'Imprisonment up to 7 years and fine',
    keywords: ['cheating', 'fraud', 'deception', 'dishonesty', 'property'],
  },
  {
    number: '498A',
    title: 'Cruelty by Husband or His Relatives',
    description:
      'Whoever, being the husband or the relative of the husband of a woman, subjects such woman to cruelty shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine.',
    punishment: 'Imprisonment up to 3 years and fine',
    keywords: ['cruelty', 'husband', 'domestic', 'dowry', 'family'],
  },
  {
    number: '506',
    title: 'Punishment for Criminal Intimidation',
    description:
      'Whoever commits the offence of criminal intimidation shall be punished with imprisonment of either description for a term which may extend to two years, or with fine which may extend to one thousand rupees, or with both.',
    punishment: 'Imprisonment up to 2 years or fine up to ₹1000 or both',
    keywords: ['threat', 'intimidation', 'fear', 'criminal', 'harassment'],
  },
  {
    number: '294',
    title: 'Obscene Acts and Songs',
    description:
      'Whoever to the annoyance of others, does any obscene act in any public place, or sings, recites or utters any obscene song, ballad or words, in or near any public place, shall be punished with imprisonment of either description for a term which may extend to three months, or with fine which may extend to two hundred and fifty rupees, or with both.',
    punishment: 'Imprisonment up to 3 months or fine up to ₹250 or both',
    keywords: ['obscene', 'public', 'annoyance', 'harassment'],
  },
  {
    number: '355',
    title: 'Assault or Criminal Force with Intent to Dishonour Person',
    description:
      'Whoever assaults or uses criminal force to any person, with intent to outrage his modesty, knowing that by so doing he is likely to outrage the modesty of that person, shall be punished with imprisonment of either description for a term which may extend to two years, or with fine which may extend to one thousand rupees, or with both.',
    punishment: 'Imprisonment up to 2 years or fine up to ₹1000 or both',
    keywords: ['assault', 'modesty', 'dishonour', 'criminal force'],
  },
  {
    number: '503',
    title: 'Criminal Intimidation',
    description:
      'Whoever threatens another with any injury to his person, reputation or property, or to the person or reputation of anyone in whom that person is interested, with intent to cause alarm to that person, or to cause that person to do any act which he is legally entitled to omit, or to omit to do any act which that person is legally entitled to do, as the means of avoiding the execution of such threat, commits criminal intimidation.',
    punishment: 'Punishment depends on aggravating factors and circumstances',
    keywords: ['threat', 'intimidation', 'injury', 'alarm', 'coercion'],
  },
  {
    number: '504',
    title: 'Intentional Insult with Knowledge it will Provoke Breach of Peace',
    description:
      'Whoever intentionally insults, and thereby causes a breach of the peace, shall be punished with imprisonment of either description for a term which may extend to three months, or with fine which may extend to two hundred and fifty rupees, or with both.',
    punishment: 'Imprisonment up to 3 months or fine up to ₹250 or both',
    keywords: ['insult', 'breach', 'peace', 'provoke'],
  },
];

export function searchLegalKnowledgeBase(query: string): IPCSection[] {
  const lowerQuery = query.toLowerCase();
  
  // Extract section numbers from query (e.g., "355" from "Section 355")
  const sectionNumbers = query.match(/\b\d{1,4}\b/g) || [];
  
  return legalKnowledgeBase.filter((section) => {
    // Direct section number match (highest priority)
    if (sectionNumbers.some(num => section.number === num)) {
      return true;
    }
    
    // Title match
    if (section.title.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Description match
    if (section.description.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Keywords match
    if (section.keywords.some((keyword) => lowerQuery.includes(keyword) || keyword.includes(lowerQuery.split(' ')[0]))) {
      return true;
    }
    
    return false;
  });
}
