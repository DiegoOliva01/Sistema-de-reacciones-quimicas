/**
 * Complete periodic table data with all 118 elements.
 * Includes properties needed for display and 3D visualization.
 */

export const ELEMENT_CATEGORIES = {
  'alkali-metal': { name: 'Metal Alcalino', color: '#ff6b6b' },
  'alkaline-earth': { name: 'Metal Alcalinotérreo', color: '#ffa94d' },
  'transition-metal': { name: 'Metal de Transición', color: '#ffd43b' },
  'post-transition-metal': { name: 'Metal Post-transición', color: '#69db7c' },
  'metalloid': { name: 'Metaloide', color: '#38d9a9' },
  'nonmetal': { name: 'No Metal', color: '#4dabf7' },
  'halogen': { name: 'Halógeno', color: '#748ffc' },
  'noble-gas': { name: 'Gas Noble', color: '#da77f2' },
  'lanthanide': { name: 'Lantánido', color: '#f783ac' },
  'actinide': { name: 'Actínido', color: '#e599f7' },
  'unknown': { name: 'Desconocido', color: '#868e96' },
};

// CPK Coloring for 3D visualization (standard chemistry colors)
export const CPK_COLORS = {
  H: '#FFFFFF',
  C: '#909090',
  N: '#3050F8',
  O: '#FF0D0D',
  F: '#90E050',
  Cl: '#1FF01F',
  Br: '#A62929',
  I: '#940094',
  S: '#FFFF30',
  P: '#FF8000',
  Fe: '#E06633',
  Na: '#AB5CF2',
  K: '#8F40D4',
  Ca: '#3DFF00',
  Mg: '#8AFF00',
  default: '#FF1493',
};

export const elementsData = [
  // Period 1
  { atomicNumber: 1, symbol: 'H', name: 'Hydrogen', nameEs: 'Hidrógeno', category: 'nonmetal', atomicMass: 1.008, group: 1, period: 1, block: 's', electronegativity: 2.20, atomicRadius: 53, cpkColor: '#FFFFFF' },
  { atomicNumber: 2, symbol: 'He', name: 'Helium', nameEs: 'Helio', category: 'noble-gas', atomicMass: 4.003, group: 18, period: 1, block: 's', electronegativity: null, atomicRadius: 31, cpkColor: '#D9FFFF' },
  
  // Period 2
  { atomicNumber: 3, symbol: 'Li', name: 'Lithium', nameEs: 'Litio', category: 'alkali-metal', atomicMass: 6.941, group: 1, period: 2, block: 's', electronegativity: 0.98, atomicRadius: 167, cpkColor: '#CC80FF' },
  { atomicNumber: 4, symbol: 'Be', name: 'Beryllium', nameEs: 'Berilio', category: 'alkaline-earth', atomicMass: 9.012, group: 2, period: 2, block: 's', electronegativity: 1.57, atomicRadius: 112, cpkColor: '#C2FF00' },
  { atomicNumber: 5, symbol: 'B', name: 'Boron', nameEs: 'Boro', category: 'metalloid', atomicMass: 10.81, group: 13, period: 2, block: 'p', electronegativity: 2.04, atomicRadius: 87, cpkColor: '#FFB5B5' },
  { atomicNumber: 6, symbol: 'C', name: 'Carbon', nameEs: 'Carbono', category: 'nonmetal', atomicMass: 12.01, group: 14, period: 2, block: 'p', electronegativity: 2.55, atomicRadius: 67, cpkColor: '#909090' },
  { atomicNumber: 7, symbol: 'N', name: 'Nitrogen', nameEs: 'Nitrógeno', category: 'nonmetal', atomicMass: 14.01, group: 15, period: 2, block: 'p', electronegativity: 3.04, atomicRadius: 56, cpkColor: '#3050F8' },
  { atomicNumber: 8, symbol: 'O', name: 'Oxygen', nameEs: 'Oxígeno', category: 'nonmetal', atomicMass: 16.00, group: 16, period: 2, block: 'p', electronegativity: 3.44, atomicRadius: 48, cpkColor: '#FF0D0D' },
  { atomicNumber: 9, symbol: 'F', name: 'Fluorine', nameEs: 'Flúor', category: 'halogen', atomicMass: 19.00, group: 17, period: 2, block: 'p', electronegativity: 3.98, atomicRadius: 42, cpkColor: '#90E050' },
  { atomicNumber: 10, symbol: 'Ne', name: 'Neon', nameEs: 'Neón', category: 'noble-gas', atomicMass: 20.18, group: 18, period: 2, block: 'p', electronegativity: null, atomicRadius: 38, cpkColor: '#B3E3F5' },
  
  // Period 3
  { atomicNumber: 11, symbol: 'Na', name: 'Sodium', nameEs: 'Sodio', category: 'alkali-metal', atomicMass: 22.99, group: 1, period: 3, block: 's', electronegativity: 0.93, atomicRadius: 190, cpkColor: '#AB5CF2' },
  { atomicNumber: 12, symbol: 'Mg', name: 'Magnesium', nameEs: 'Magnesio', category: 'alkaline-earth', atomicMass: 24.31, group: 2, period: 3, block: 's', electronegativity: 1.31, atomicRadius: 145, cpkColor: '#8AFF00' },
  { atomicNumber: 13, symbol: 'Al', name: 'Aluminum', nameEs: 'Aluminio', category: 'post-transition-metal', atomicMass: 26.98, group: 13, period: 3, block: 'p', electronegativity: 1.61, atomicRadius: 118, cpkColor: '#BFA6A6' },
  { atomicNumber: 14, symbol: 'Si', name: 'Silicon', nameEs: 'Silicio', category: 'metalloid', atomicMass: 28.09, group: 14, period: 3, block: 'p', electronegativity: 1.90, atomicRadius: 111, cpkColor: '#F0C8A0' },
  { atomicNumber: 15, symbol: 'P', name: 'Phosphorus', nameEs: 'Fósforo', category: 'nonmetal', atomicMass: 30.97, group: 15, period: 3, block: 'p', electronegativity: 2.19, atomicRadius: 98, cpkColor: '#FF8000' },
  { atomicNumber: 16, symbol: 'S', name: 'Sulfur', nameEs: 'Azufre', category: 'nonmetal', atomicMass: 32.07, group: 16, period: 3, block: 'p', electronegativity: 2.58, atomicRadius: 88, cpkColor: '#FFFF30' },
  { atomicNumber: 17, symbol: 'Cl', name: 'Chlorine', nameEs: 'Cloro', category: 'halogen', atomicMass: 35.45, group: 17, period: 3, block: 'p', electronegativity: 3.16, atomicRadius: 79, cpkColor: '#1FF01F' },
  { atomicNumber: 18, symbol: 'Ar', name: 'Argon', nameEs: 'Argón', category: 'noble-gas', atomicMass: 39.95, group: 18, period: 3, block: 'p', electronegativity: null, atomicRadius: 71, cpkColor: '#80D1E3' },
  
  // Period 4
  { atomicNumber: 19, symbol: 'K', name: 'Potassium', nameEs: 'Potasio', category: 'alkali-metal', atomicMass: 39.10, group: 1, period: 4, block: 's', electronegativity: 0.82, atomicRadius: 243, cpkColor: '#8F40D4' },
  { atomicNumber: 20, symbol: 'Ca', name: 'Calcium', nameEs: 'Calcio', category: 'alkaline-earth', atomicMass: 40.08, group: 2, period: 4, block: 's', electronegativity: 1.00, atomicRadius: 194, cpkColor: '#3DFF00' },
  { atomicNumber: 21, symbol: 'Sc', name: 'Scandium', nameEs: 'Escandio', category: 'transition-metal', atomicMass: 44.96, group: 3, period: 4, block: 'd', electronegativity: 1.36, atomicRadius: 184, cpkColor: '#E6E6E6' },
  { atomicNumber: 22, symbol: 'Ti', name: 'Titanium', nameEs: 'Titanio', category: 'transition-metal', atomicMass: 47.87, group: 4, period: 4, block: 'd', electronegativity: 1.54, atomicRadius: 176, cpkColor: '#BFC2C7' },
  { atomicNumber: 23, symbol: 'V', name: 'Vanadium', nameEs: 'Vanadio', category: 'transition-metal', atomicMass: 50.94, group: 5, period: 4, block: 'd', electronegativity: 1.63, atomicRadius: 171, cpkColor: '#A6A6AB' },
  { atomicNumber: 24, symbol: 'Cr', name: 'Chromium', nameEs: 'Cromo', category: 'transition-metal', atomicMass: 52.00, group: 6, period: 4, block: 'd', electronegativity: 1.66, atomicRadius: 166, cpkColor: '#8A99C7' },
  { atomicNumber: 25, symbol: 'Mn', name: 'Manganese', nameEs: 'Manganeso', category: 'transition-metal', atomicMass: 54.94, group: 7, period: 4, block: 'd', electronegativity: 1.55, atomicRadius: 161, cpkColor: '#9C7AC7' },
  { atomicNumber: 26, symbol: 'Fe', name: 'Iron', nameEs: 'Hierro', category: 'transition-metal', atomicMass: 55.85, group: 8, period: 4, block: 'd', electronegativity: 1.83, atomicRadius: 156, cpkColor: '#E06633' },
  { atomicNumber: 27, symbol: 'Co', name: 'Cobalt', nameEs: 'Cobalto', category: 'transition-metal', atomicMass: 58.93, group: 9, period: 4, block: 'd', electronegativity: 1.88, atomicRadius: 152, cpkColor: '#F090A0' },
  { atomicNumber: 28, symbol: 'Ni', name: 'Nickel', nameEs: 'Níquel', category: 'transition-metal', atomicMass: 58.69, group: 10, period: 4, block: 'd', electronegativity: 1.91, atomicRadius: 149, cpkColor: '#50D050' },
  { atomicNumber: 29, symbol: 'Cu', name: 'Copper', nameEs: 'Cobre', category: 'transition-metal', atomicMass: 63.55, group: 11, period: 4, block: 'd', electronegativity: 1.90, atomicRadius: 145, cpkColor: '#C88033' },
  { atomicNumber: 30, symbol: 'Zn', name: 'Zinc', nameEs: 'Zinc', category: 'transition-metal', atomicMass: 65.38, group: 12, period: 4, block: 'd', electronegativity: 1.65, atomicRadius: 142, cpkColor: '#7D80B0' },
  { atomicNumber: 31, symbol: 'Ga', name: 'Gallium', nameEs: 'Galio', category: 'post-transition-metal', atomicMass: 69.72, group: 13, period: 4, block: 'p', electronegativity: 1.81, atomicRadius: 136, cpkColor: '#C28F8F' },
  { atomicNumber: 32, symbol: 'Ge', name: 'Germanium', nameEs: 'Germanio', category: 'metalloid', atomicMass: 72.63, group: 14, period: 4, block: 'p', electronegativity: 2.01, atomicRadius: 125, cpkColor: '#668F8F' },
  { atomicNumber: 33, symbol: 'As', name: 'Arsenic', nameEs: 'Arsénico', category: 'metalloid', atomicMass: 74.92, group: 15, period: 4, block: 'p', electronegativity: 2.18, atomicRadius: 114, cpkColor: '#BD80E3' },
  { atomicNumber: 34, symbol: 'Se', name: 'Selenium', nameEs: 'Selenio', category: 'nonmetal', atomicMass: 78.97, group: 16, period: 4, block: 'p', electronegativity: 2.55, atomicRadius: 103, cpkColor: '#FFA100' },
  { atomicNumber: 35, symbol: 'Br', name: 'Bromine', nameEs: 'Bromo', category: 'halogen', atomicMass: 79.90, group: 17, period: 4, block: 'p', electronegativity: 2.96, atomicRadius: 94, cpkColor: '#A62929' },
  { atomicNumber: 36, symbol: 'Kr', name: 'Krypton', nameEs: 'Kriptón', category: 'noble-gas', atomicMass: 83.80, group: 18, period: 4, block: 'p', electronegativity: 3.00, atomicRadius: 88, cpkColor: '#5CB8D1' },
  
  // Period 5
  { atomicNumber: 37, symbol: 'Rb', name: 'Rubidium', nameEs: 'Rubidio', category: 'alkali-metal', atomicMass: 85.47, group: 1, period: 5, block: 's', electronegativity: 0.82, atomicRadius: 265, cpkColor: '#702EB0' },
  { atomicNumber: 38, symbol: 'Sr', name: 'Strontium', nameEs: 'Estroncio', category: 'alkaline-earth', atomicMass: 87.62, group: 2, period: 5, block: 's', electronegativity: 0.95, atomicRadius: 219, cpkColor: '#00FF00' },
  { atomicNumber: 39, symbol: 'Y', name: 'Yttrium', nameEs: 'Itrio', category: 'transition-metal', atomicMass: 88.91, group: 3, period: 5, block: 'd', electronegativity: 1.22, atomicRadius: 212, cpkColor: '#94FFFF' },
  { atomicNumber: 40, symbol: 'Zr', name: 'Zirconium', nameEs: 'Circonio', category: 'transition-metal', atomicMass: 91.22, group: 4, period: 5, block: 'd', electronegativity: 1.33, atomicRadius: 206, cpkColor: '#94E0E0' },
  { atomicNumber: 41, symbol: 'Nb', name: 'Niobium', nameEs: 'Niobio', category: 'transition-metal', atomicMass: 92.91, group: 5, period: 5, block: 'd', electronegativity: 1.6, atomicRadius: 198, cpkColor: '#73C2C9' },
  { atomicNumber: 42, symbol: 'Mo', name: 'Molybdenum', nameEs: 'Molibdeno', category: 'transition-metal', atomicMass: 95.95, group: 6, period: 5, block: 'd', electronegativity: 2.16, atomicRadius: 190, cpkColor: '#54B5B5' },
  { atomicNumber: 43, symbol: 'Tc', name: 'Technetium', nameEs: 'Tecnecio', category: 'transition-metal', atomicMass: 98, group: 7, period: 5, block: 'd', electronegativity: 1.9, atomicRadius: 183, cpkColor: '#3B9E9E' },
  { atomicNumber: 44, symbol: 'Ru', name: 'Ruthenium', nameEs: 'Rutenio', category: 'transition-metal', atomicMass: 101.1, group: 8, period: 5, block: 'd', electronegativity: 2.2, atomicRadius: 178, cpkColor: '#248F8F' },
  { atomicNumber: 45, symbol: 'Rh', name: 'Rhodium', nameEs: 'Rodio', category: 'transition-metal', atomicMass: 102.9, group: 9, period: 5, block: 'd', electronegativity: 2.28, atomicRadius: 173, cpkColor: '#0A7D8C' },
  { atomicNumber: 46, symbol: 'Pd', name: 'Palladium', nameEs: 'Paladio', category: 'transition-metal', atomicMass: 106.4, group: 10, period: 5, block: 'd', electronegativity: 2.20, atomicRadius: 169, cpkColor: '#006985' },
  { atomicNumber: 47, symbol: 'Ag', name: 'Silver', nameEs: 'Plata', category: 'transition-metal', atomicMass: 107.9, group: 11, period: 5, block: 'd', electronegativity: 1.93, atomicRadius: 165, cpkColor: '#C0C0C0' },
  { atomicNumber: 48, symbol: 'Cd', name: 'Cadmium', nameEs: 'Cadmio', category: 'transition-metal', atomicMass: 112.4, group: 12, period: 5, block: 'd', electronegativity: 1.69, atomicRadius: 161, cpkColor: '#FFD98F' },
  { atomicNumber: 49, symbol: 'In', name: 'Indium', nameEs: 'Indio', category: 'post-transition-metal', atomicMass: 114.8, group: 13, period: 5, block: 'p', electronegativity: 1.78, atomicRadius: 156, cpkColor: '#A67573' },
  { atomicNumber: 50, symbol: 'Sn', name: 'Tin', nameEs: 'Estaño', category: 'post-transition-metal', atomicMass: 118.7, group: 14, period: 5, block: 'p', electronegativity: 1.96, atomicRadius: 145, cpkColor: '#668080' },
  { atomicNumber: 51, symbol: 'Sb', name: 'Antimony', nameEs: 'Antimonio', category: 'metalloid', atomicMass: 121.8, group: 15, period: 5, block: 'p', electronegativity: 2.05, atomicRadius: 133, cpkColor: '#9E63B5' },
  { atomicNumber: 52, symbol: 'Te', name: 'Tellurium', nameEs: 'Telurio', category: 'metalloid', atomicMass: 127.6, group: 16, period: 5, block: 'p', electronegativity: 2.1, atomicRadius: 123, cpkColor: '#D47A00' },
  { atomicNumber: 53, symbol: 'I', name: 'Iodine', nameEs: 'Yodo', category: 'halogen', atomicMass: 126.9, group: 17, period: 5, block: 'p', electronegativity: 2.66, atomicRadius: 115, cpkColor: '#940094' },
  { atomicNumber: 54, symbol: 'Xe', name: 'Xenon', nameEs: 'Xenón', category: 'noble-gas', atomicMass: 131.3, group: 18, period: 5, block: 'p', electronegativity: 2.6, atomicRadius: 108, cpkColor: '#429EB0' },
  
  // Period 6
  { atomicNumber: 55, symbol: 'Cs', name: 'Cesium', nameEs: 'Cesio', category: 'alkali-metal', atomicMass: 132.9, group: 1, period: 6, block: 's', electronegativity: 0.79, atomicRadius: 298, cpkColor: '#57178F' },
  { atomicNumber: 56, symbol: 'Ba', name: 'Barium', nameEs: 'Bario', category: 'alkaline-earth', atomicMass: 137.3, group: 2, period: 6, block: 's', electronegativity: 0.89, atomicRadius: 253, cpkColor: '#00C900' },
  
  // Lanthanides (57-71)
  { atomicNumber: 57, symbol: 'La', name: 'Lanthanum', nameEs: 'Lantano', category: 'lanthanide', atomicMass: 138.9, group: 3, period: 6, block: 'f', electronegativity: 1.1, atomicRadius: 195, cpkColor: '#70D4FF' },
  { atomicNumber: 58, symbol: 'Ce', name: 'Cerium', nameEs: 'Cerio', category: 'lanthanide', atomicMass: 140.1, group: 3, period: 6, block: 'f', electronegativity: 1.12, atomicRadius: 185, cpkColor: '#FFFFC7' },
  { atomicNumber: 59, symbol: 'Pr', name: 'Praseodymium', nameEs: 'Praseodimio', category: 'lanthanide', atomicMass: 140.9, group: 3, period: 6, block: 'f', electronegativity: 1.13, atomicRadius: 247, cpkColor: '#D9FFC7' },
  { atomicNumber: 60, symbol: 'Nd', name: 'Neodymium', nameEs: 'Neodimio', category: 'lanthanide', atomicMass: 144.2, group: 3, period: 6, block: 'f', electronegativity: 1.14, atomicRadius: 206, cpkColor: '#C7FFC7' },
  { atomicNumber: 61, symbol: 'Pm', name: 'Promethium', nameEs: 'Prometio', category: 'lanthanide', atomicMass: 145, group: 3, period: 6, block: 'f', electronegativity: 1.13, atomicRadius: 205, cpkColor: '#A3FFC7' },
  { atomicNumber: 62, symbol: 'Sm', name: 'Samarium', nameEs: 'Samario', category: 'lanthanide', atomicMass: 150.4, group: 3, period: 6, block: 'f', electronegativity: 1.17, atomicRadius: 238, cpkColor: '#8FFFC7' },
  { atomicNumber: 63, symbol: 'Eu', name: 'Europium', nameEs: 'Europio', category: 'lanthanide', atomicMass: 152.0, group: 3, period: 6, block: 'f', electronegativity: 1.2, atomicRadius: 231, cpkColor: '#61FFC7' },
  { atomicNumber: 64, symbol: 'Gd', name: 'Gadolinium', nameEs: 'Gadolinio', category: 'lanthanide', atomicMass: 157.3, group: 3, period: 6, block: 'f', electronegativity: 1.2, atomicRadius: 233, cpkColor: '#45FFC7' },
  { atomicNumber: 65, symbol: 'Tb', name: 'Terbium', nameEs: 'Terbio', category: 'lanthanide', atomicMass: 158.9, group: 3, period: 6, block: 'f', electronegativity: 1.1, atomicRadius: 225, cpkColor: '#30FFC7' },
  { atomicNumber: 66, symbol: 'Dy', name: 'Dysprosium', nameEs: 'Disprosio', category: 'lanthanide', atomicMass: 162.5, group: 3, period: 6, block: 'f', electronegativity: 1.22, atomicRadius: 228, cpkColor: '#1FFFC7' },
  { atomicNumber: 67, symbol: 'Ho', name: 'Holmium', nameEs: 'Holmio', category: 'lanthanide', atomicMass: 164.9, group: 3, period: 6, block: 'f', electronegativity: 1.23, atomicRadius: 226, cpkColor: '#00FF9C' },
  { atomicNumber: 68, symbol: 'Er', name: 'Erbium', nameEs: 'Erbio', category: 'lanthanide', atomicMass: 167.3, group: 3, period: 6, block: 'f', electronegativity: 1.24, atomicRadius: 226, cpkColor: '#00E675' },
  { atomicNumber: 69, symbol: 'Tm', name: 'Thulium', nameEs: 'Tulio', category: 'lanthanide', atomicMass: 168.9, group: 3, period: 6, block: 'f', electronegativity: 1.25, atomicRadius: 222, cpkColor: '#00D452' },
  { atomicNumber: 70, symbol: 'Yb', name: 'Ytterbium', nameEs: 'Iterbio', category: 'lanthanide', atomicMass: 173.0, group: 3, period: 6, block: 'f', electronegativity: 1.1, atomicRadius: 222, cpkColor: '#00BF38' },
  { atomicNumber: 71, symbol: 'Lu', name: 'Lutetium', nameEs: 'Lutecio', category: 'lanthanide', atomicMass: 175.0, group: 3, period: 6, block: 'd', electronegativity: 1.27, atomicRadius: 217, cpkColor: '#00AB24' },
  
  // Continue Period 6
  { atomicNumber: 72, symbol: 'Hf', name: 'Hafnium', nameEs: 'Hafnio', category: 'transition-metal', atomicMass: 178.5, group: 4, period: 6, block: 'd', electronegativity: 1.3, atomicRadius: 208, cpkColor: '#4DC2FF' },
  { atomicNumber: 73, symbol: 'Ta', name: 'Tantalum', nameEs: 'Tantalio', category: 'transition-metal', atomicMass: 180.9, group: 5, period: 6, block: 'd', electronegativity: 1.5, atomicRadius: 200, cpkColor: '#4DA6FF' },
  { atomicNumber: 74, symbol: 'W', name: 'Tungsten', nameEs: 'Wolframio', category: 'transition-metal', atomicMass: 183.8, group: 6, period: 6, block: 'd', electronegativity: 2.36, atomicRadius: 193, cpkColor: '#2194D6' },
  { atomicNumber: 75, symbol: 'Re', name: 'Rhenium', nameEs: 'Renio', category: 'transition-metal', atomicMass: 186.2, group: 7, period: 6, block: 'd', electronegativity: 1.9, atomicRadius: 188, cpkColor: '#267DAB' },
  { atomicNumber: 76, symbol: 'Os', name: 'Osmium', nameEs: 'Osmio', category: 'transition-metal', atomicMass: 190.2, group: 8, period: 6, block: 'd', electronegativity: 2.2, atomicRadius: 185, cpkColor: '#266696' },
  { atomicNumber: 77, symbol: 'Ir', name: 'Iridium', nameEs: 'Iridio', category: 'transition-metal', atomicMass: 192.2, group: 9, period: 6, block: 'd', electronegativity: 2.20, atomicRadius: 180, cpkColor: '#175487' },
  { atomicNumber: 78, symbol: 'Pt', name: 'Platinum', nameEs: 'Platino', category: 'transition-metal', atomicMass: 195.1, group: 10, period: 6, block: 'd', electronegativity: 2.28, atomicRadius: 177, cpkColor: '#D0D0E0' },
  { atomicNumber: 79, symbol: 'Au', name: 'Gold', nameEs: 'Oro', category: 'transition-metal', atomicMass: 197.0, group: 11, period: 6, block: 'd', electronegativity: 2.54, atomicRadius: 174, cpkColor: '#FFD123' },
  { atomicNumber: 80, symbol: 'Hg', name: 'Mercury', nameEs: 'Mercurio', category: 'transition-metal', atomicMass: 200.6, group: 12, period: 6, block: 'd', electronegativity: 2.00, atomicRadius: 171, cpkColor: '#B8B8D0' },
  { atomicNumber: 81, symbol: 'Tl', name: 'Thallium', nameEs: 'Talio', category: 'post-transition-metal', atomicMass: 204.4, group: 13, period: 6, block: 'p', electronegativity: 1.62, atomicRadius: 156, cpkColor: '#A6544D' },
  { atomicNumber: 82, symbol: 'Pb', name: 'Lead', nameEs: 'Plomo', category: 'post-transition-metal', atomicMass: 207.2, group: 14, period: 6, block: 'p', electronegativity: 2.33, atomicRadius: 154, cpkColor: '#575961' },
  { atomicNumber: 83, symbol: 'Bi', name: 'Bismuth', nameEs: 'Bismuto', category: 'post-transition-metal', atomicMass: 209.0, group: 15, period: 6, block: 'p', electronegativity: 2.02, atomicRadius: 143, cpkColor: '#9E4FB5' },
  { atomicNumber: 84, symbol: 'Po', name: 'Polonium', nameEs: 'Polonio', category: 'metalloid', atomicMass: 209, group: 16, period: 6, block: 'p', electronegativity: 2.0, atomicRadius: 135, cpkColor: '#AB5C00' },
  { atomicNumber: 85, symbol: 'At', name: 'Astatine', nameEs: 'Astato', category: 'halogen', atomicMass: 210, group: 17, period: 6, block: 'p', electronegativity: 2.2, atomicRadius: 127, cpkColor: '#754F45' },
  { atomicNumber: 86, symbol: 'Rn', name: 'Radon', nameEs: 'Radón', category: 'noble-gas', atomicMass: 222, group: 18, period: 6, block: 'p', electronegativity: 2.2, atomicRadius: 120, cpkColor: '#428296' },
  
  // Period 7
  { atomicNumber: 87, symbol: 'Fr', name: 'Francium', nameEs: 'Francio', category: 'alkali-metal', atomicMass: 223, group: 1, period: 7, block: 's', electronegativity: 0.7, atomicRadius: 348, cpkColor: '#420066' },
  { atomicNumber: 88, symbol: 'Ra', name: 'Radium', nameEs: 'Radio', category: 'alkaline-earth', atomicMass: 226, group: 2, period: 7, block: 's', electronegativity: 0.9, atomicRadius: 283, cpkColor: '#007D00' },
  
  // Actinides (89-103)
  { atomicNumber: 89, symbol: 'Ac', name: 'Actinium', nameEs: 'Actinio', category: 'actinide', atomicMass: 227, group: 3, period: 7, block: 'f', electronegativity: 1.1, atomicRadius: 215, cpkColor: '#70ABFA' },
  { atomicNumber: 90, symbol: 'Th', name: 'Thorium', nameEs: 'Torio', category: 'actinide', atomicMass: 232.0, group: 3, period: 7, block: 'f', electronegativity: 1.3, atomicRadius: 206, cpkColor: '#00BAFF' },
  { atomicNumber: 91, symbol: 'Pa', name: 'Protactinium', nameEs: 'Protactinio', category: 'actinide', atomicMass: 231.0, group: 3, period: 7, block: 'f', electronegativity: 1.5, atomicRadius: 200, cpkColor: '#00A1FF' },
  { atomicNumber: 92, symbol: 'U', name: 'Uranium', nameEs: 'Uranio', category: 'actinide', atomicMass: 238.0, group: 3, period: 7, block: 'f', electronegativity: 1.38, atomicRadius: 196, cpkColor: '#008FFF' },
  { atomicNumber: 93, symbol: 'Np', name: 'Neptunium', nameEs: 'Neptunio', category: 'actinide', atomicMass: 237, group: 3, period: 7, block: 'f', electronegativity: 1.36, atomicRadius: 190, cpkColor: '#0080FF' },
  { atomicNumber: 94, symbol: 'Pu', name: 'Plutonium', nameEs: 'Plutonio', category: 'actinide', atomicMass: 244, group: 3, period: 7, block: 'f', electronegativity: 1.28, atomicRadius: 187, cpkColor: '#006BFF' },
  { atomicNumber: 95, symbol: 'Am', name: 'Americium', nameEs: 'Americio', category: 'actinide', atomicMass: 243, group: 3, period: 7, block: 'f', electronegativity: 1.13, atomicRadius: 180, cpkColor: '#545CF2' },
  { atomicNumber: 96, symbol: 'Cm', name: 'Curium', nameEs: 'Curio', category: 'actinide', atomicMass: 247, group: 3, period: 7, block: 'f', electronegativity: 1.28, atomicRadius: 169, cpkColor: '#785CE3' },
  { atomicNumber: 97, symbol: 'Bk', name: 'Berkelium', nameEs: 'Berkelio', category: 'actinide', atomicMass: 247, group: 3, period: 7, block: 'f', electronegativity: 1.3, atomicRadius: 170, cpkColor: '#8A4FE3' },
  { atomicNumber: 98, symbol: 'Cf', name: 'Californium', nameEs: 'Californio', category: 'actinide', atomicMass: 251, group: 3, period: 7, block: 'f', electronegativity: 1.3, atomicRadius: 186, cpkColor: '#A136D4' },
  { atomicNumber: 99, symbol: 'Es', name: 'Einsteinium', nameEs: 'Einstenio', category: 'actinide', atomicMass: 252, group: 3, period: 7, block: 'f', electronegativity: 1.3, atomicRadius: 186, cpkColor: '#B31FD4' },
  { atomicNumber: 100, symbol: 'Fm', name: 'Fermium', nameEs: 'Fermio', category: 'actinide', atomicMass: 257, group: 3, period: 7, block: 'f', electronegativity: 1.3, atomicRadius: null, cpkColor: '#B31FBA' },
  { atomicNumber: 101, symbol: 'Md', name: 'Mendelevium', nameEs: 'Mendelevio', category: 'actinide', atomicMass: 258, group: 3, period: 7, block: 'f', electronegativity: 1.3, atomicRadius: null, cpkColor: '#B30DA6' },
  { atomicNumber: 102, symbol: 'No', name: 'Nobelium', nameEs: 'Nobelio', category: 'actinide', atomicMass: 259, group: 3, period: 7, block: 'f', electronegativity: 1.3, atomicRadius: null, cpkColor: '#BD0D87' },
  { atomicNumber: 103, symbol: 'Lr', name: 'Lawrencium', nameEs: 'Lawrencio', category: 'actinide', atomicMass: 262, group: 3, period: 7, block: 'd', electronegativity: 1.3, atomicRadius: null, cpkColor: '#C70066' },
  
  // Continue Period 7
  { atomicNumber: 104, symbol: 'Rf', name: 'Rutherfordium', nameEs: 'Rutherfordio', category: 'transition-metal', atomicMass: 267, group: 4, period: 7, block: 'd', electronegativity: null, atomicRadius: null, cpkColor: '#CC0059' },
  { atomicNumber: 105, symbol: 'Db', name: 'Dubnium', nameEs: 'Dubnio', category: 'transition-metal', atomicMass: 268, group: 5, period: 7, block: 'd', electronegativity: null, atomicRadius: null, cpkColor: '#D1004F' },
  { atomicNumber: 106, symbol: 'Sg', name: 'Seaborgium', nameEs: 'Seaborgio', category: 'transition-metal', atomicMass: 269, group: 6, period: 7, block: 'd', electronegativity: null, atomicRadius: null, cpkColor: '#D90045' },
  { atomicNumber: 107, symbol: 'Bh', name: 'Bohrium', nameEs: 'Bohrio', category: 'transition-metal', atomicMass: 270, group: 7, period: 7, block: 'd', electronegativity: null, atomicRadius: null, cpkColor: '#E00038' },
  { atomicNumber: 108, symbol: 'Hs', name: 'Hassium', nameEs: 'Hasio', category: 'transition-metal', atomicMass: 269, group: 8, period: 7, block: 'd', electronegativity: null, atomicRadius: null, cpkColor: '#E6002E' },
  { atomicNumber: 109, symbol: 'Mt', name: 'Meitnerium', nameEs: 'Meitnerio', category: 'unknown', atomicMass: 278, group: 9, period: 7, block: 'd', electronegativity: null, atomicRadius: null, cpkColor: '#EB0026' },
  { atomicNumber: 110, symbol: 'Ds', name: 'Darmstadtium', nameEs: 'Darmstatio', category: 'unknown', atomicMass: 281, group: 10, period: 7, block: 'd', electronegativity: null, atomicRadius: null, cpkColor: '#000000' },
  { atomicNumber: 111, symbol: 'Rg', name: 'Roentgenium', nameEs: 'Roentgenio', category: 'unknown', atomicMass: 282, group: 11, period: 7, block: 'd', electronegativity: null, atomicRadius: null, cpkColor: '#000000' },
  { atomicNumber: 112, symbol: 'Cn', name: 'Copernicium', nameEs: 'Copernicio', category: 'unknown', atomicMass: 285, group: 12, period: 7, block: 'd', electronegativity: null, atomicRadius: null, cpkColor: '#000000' },
  { atomicNumber: 113, symbol: 'Nh', name: 'Nihonium', nameEs: 'Nihonio', category: 'unknown', atomicMass: 286, group: 13, period: 7, block: 'p', electronegativity: null, atomicRadius: null, cpkColor: '#000000' },
  { atomicNumber: 114, symbol: 'Fl', name: 'Flerovium', nameEs: 'Flerovio', category: 'unknown', atomicMass: 289, group: 14, period: 7, block: 'p', electronegativity: null, atomicRadius: null, cpkColor: '#000000' },
  { atomicNumber: 115, symbol: 'Mc', name: 'Moscovium', nameEs: 'Moscovio', category: 'unknown', atomicMass: 290, group: 15, period: 7, block: 'p', electronegativity: null, atomicRadius: null, cpkColor: '#000000' },
  { atomicNumber: 116, symbol: 'Lv', name: 'Livermorium', nameEs: 'Livermorio', category: 'unknown', atomicMass: 293, group: 16, period: 7, block: 'p', electronegativity: null, atomicRadius: null, cpkColor: '#000000' },
  { atomicNumber: 117, symbol: 'Ts', name: 'Tennessine', nameEs: 'Teneso', category: 'unknown', atomicMass: 294, group: 17, period: 7, block: 'p', electronegativity: null, atomicRadius: null, cpkColor: '#000000' },
  { atomicNumber: 118, symbol: 'Og', name: 'Oganesson', nameEs: 'Oganesón', category: 'unknown', atomicMass: 294, group: 18, period: 7, block: 'p', electronegativity: null, atomicRadius: null, cpkColor: '#000000' },
];

// Helper function to get element by symbol
export const getElementBySymbol = (symbol) => {
  return elementsData.find(el => el.symbol.toLowerCase() === symbol.toLowerCase());
};

// Helper function to get element by atomic number
export const getElementByNumber = (atomicNumber) => {
  return elementsData.find(el => el.atomicNumber === atomicNumber);
};

// Get category info
export const getCategoryInfo = (category) => {
  return ELEMENT_CATEGORIES[category] || ELEMENT_CATEGORIES['unknown'];
};
