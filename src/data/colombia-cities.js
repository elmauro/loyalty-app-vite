/**
 * Departamentos y ciudades de Colombia (códigos DANE/Divipola).
 * Fuente: Divipola - DANE. Más adelante se puede reemplazar por un servicio API.
 *
 * Estructura: { id, name, cities: [{ id, name }] }
 * - id departamento: código de 2 dígitos
 * - id ciudad: código de 5 dígitos (DANE municipio)
 */
export const colombiaDepartments = [
  { id: 11, name: 'Bogotá D.C.', cities: [{ id: 11001, name: 'Bogotá, D.C.' }] },
  {
    id: 5,
    name: 'Antioquia',
    cities: [
      { id: 5001, name: 'Medellín' },
      { id: 5411, name: 'Envigado' },
      { id: 5088, name: 'Bello' },
      { id: 5360, name: 'Itagüí' },
      { id: 5315, name: 'Sabaneta' },
      { id: 5042, name: 'Rionegro' },
      { id: 5079, name: 'La Estrella' },
      { id: 5045, name: 'Copacabana' },
      { id: 5125, name: 'Girardota' },
      { id: 5266, name: 'Barbosa' },
    ],
  },
  {
    id: 8,
    name: 'Atlántico',
    cities: [
      { id: 8001, name: 'Barranquilla' },
      { id: 8573, name: 'Soledad' },
      { id: 8296, name: 'Malambo' },
      { id: 8137, name: 'Galapa' },
      { id: 8360, name: 'Puerto Colombia' },
    ],
  },
  {
    id: 76,
    name: 'Valle del Cauca',
    cities: [
      { id: 76001, name: 'Cali' },
      { id: 76520, name: 'Palmira' },
      { id: 76890, name: 'Yumbo' },
      { id: 76109, name: 'Buga' },
      { id: 76828, name: 'Tuluá' },
      { id: 76243, name: 'Cartago' },
      { id: 76364, name: 'Jamundí' },
    ],
  },
  {
    id: 66,
    name: 'Risaralda',
    cities: [
      { id: 66001, name: 'Pereira' },
      { id: 66170, name: 'Dosquebradas' },
      { id: 66400, name: 'La Virginia' },
      { id: 66456, name: 'Marsella' },
    ],
  },
  {
    id: 63,
    name: 'Quindío',
    cities: [
      { id: 63001, name: 'Armenia' },
      { id: 63190, name: 'Calarcá' },
      { id: 63548, name: 'Montenegro' },
      { id: 63690, name: 'Quimbaya' },
    ],
  },
  {
    id: 68,
    name: 'Santander',
    cities: [
      { id: 68001, name: 'Bucaramanga' },
      { id: 68167, name: 'Floridablanca' },
      { id: 68271, name: 'Girón' },
      { id: 68498, name: 'Piedecuesta' },
      { id: 68755, name: 'Barrancabermeja' },
    ],
  },
  {
    id: 54,
    name: 'Norte de Santander',
    cities: [
      { id: 54001, name: 'Cúcuta' },
      { id: 54172, name: 'Los Patios' },
      { id: 54800, name: 'Villa del Rosario' },
      { id: 54680, name: 'Ocaña' },
    ],
  },
  {
    id: 13,
    name: 'Bolívar',
    cities: [
      { id: 13001, name: 'Cartagena de Indias' },
      { id: 13442, name: 'Magangué' },
      { id: 13468, name: 'Mahates' },
      { id: 13647, name: 'Turbaco' },
    ],
  },
  {
    id: 47,
    name: 'Magdalena',
    cities: [
      { id: 47001, name: 'Santa Marta' },
      { id: 47189, name: 'Ciénaga' },
      { id: 47288, name: 'Fundación' },
      { id: 47551, name: 'Pivijay' },
    ],
  },
  {
    id: 23,
    name: 'Córdoba',
    cities: [
      { id: 23001, name: 'Montería' },
      { id: 23068, name: 'Ayapel' },
      { id: 23162, name: 'Cereté' },
      { id: 23417, name: 'Lorica' },
      { id: 23675, name: 'Sahagún' },
    ],
  },
  {
    id: 70,
    name: 'Sucre',
    cities: [
      { id: 70001, name: 'Sincelejo' },
      { id: 70221, name: 'Corozal' },
      { id: 70429, name: 'Sampués' },
      { id: 70742, name: 'San Marcos' },
    ],
  },
  {
    id: 20,
    name: 'Cesar',
    cities: [
      { id: 20001, name: 'Valledupar' },
      { id: 20175, name: 'Agustín Codazzi' },
      { id: 20238, name: 'Bosconia' },
      { id: 20787, name: 'La Paz' },
    ],
  },
  {
    id: 44,
    name: 'La Guajira',
    cities: [
      { id: 44001, name: 'Riohacha' },
      { id: 44035, name: 'Albania' },
      { id: 44090, name: 'Barrancas' },
      { id: 44874, name: 'Uribia' },
    ],
  },
  {
    id: 15,
    name: 'Boyacá',
    cities: [
      { id: 15001, name: 'Tunja' },
      { id: 15022, name: 'Almeida' },
      { id: 15172, name: 'Chiquinquirá' },
      { id: 15407, name: 'Duitama' },
      { id: 15491, name: 'Garagoa' },
      { id: 15572, name: 'Sogamoso' },
    ],
  },
  {
    id: 25,
    name: 'Cundinamarca',
    cities: [
      { id: 25001, name: 'Agua de Dios' },
      { id: 25126, name: 'Chía' },
      { id: 25269, name: 'Facatativá' },
      { id: 25286, name: 'Fusagasugá' },
      { id: 25407, name: 'Girardot' },
      { id: 25473, name: 'Guaduas' },
      { id: 25736, name: 'Soacha' },
      { id: 25823, name: 'Zipaquirá' },
    ],
  },
  {
    id: 17,
    name: 'Caldas',
    cities: [
      { id: 17001, name: 'Manizales' },
      { id: 17042, name: 'Aguadas' },
      { id: 17433, name: 'La Dorada' },
      { id: 17486, name: 'Manzanares' },
      { id: 17665, name: 'Riosucio' },
    ],
  },
  {
    id: 73,
    name: 'Tolima',
    cities: [
      { id: 73001, name: 'Ibagué' },
      { id: 73024, name: 'Alpujarra' },
      { id: 73236, name: 'Espinal' },
      { id: 73408, name: 'Honda' },
      { id: 73585, name: 'Mariquita' },
    ],
  },
  {
    id: 41,
    name: 'Huila',
    cities: [
      { id: 41001, name: 'Neiva' },
      { id: 41013, name: 'Acevedo' },
      { id: 41298, name: 'Garzón' },
      { id: 41396, name: 'La Plata' },
      { id: 41551, name: 'Pitalito' },
    ],
  },
  {
    id: 19,
    name: 'Cauca',
    cities: [
      { id: 19001, name: 'Popayán' },
      { id: 19110, name: 'Caldono' },
      { id: 19256, name: 'El Tambo' },
      { id: 19318, name: 'Guapi' },
      { id: 19821, name: 'Santander de Quilichao' },
    ],
  },
  {
    id: 52,
    name: 'Nariño',
    cities: [
      { id: 52001, name: 'Pasto' },
      { id: 52019, name: 'Albán' },
      { id: 52240, name: 'Ipiales' },
      { id: 52683, name: 'Tumaco' },
      { id: 52835, name: 'Túquerres' },
    ],
  },
  {
    id: 50,
    name: 'Meta',
    cities: [
      { id: 50001, name: 'Villavicencio' },
      { id: 50006, name: 'Acacías' },
      { id: 50325, name: 'Granada' },
      { id: 50689, name: 'Restrepo' },
    ],
  },
  {
    id: 85,
    name: 'Casanare',
    cities: [
      { id: 85001, name: 'Yopal' },
      { id: 85010, name: 'Aguazul' },
      { id: 85125, name: 'Monterrey' },
      { id: 85230, name: 'Tauramena' },
    ],
  },
  {
    id: 81,
    name: 'Arauca',
    cities: [
      { id: 81001, name: 'Arauca' },
      { id: 81065, name: 'Arauquita' },
      { id: 81220, name: 'Cravo Norte' },
      { id: 81591, name: 'Saravena' },
    ],
  },
  {
    id: 18,
    name: 'Caquetá',
    cities: [
      { id: 18001, name: 'Florencia' },
      { id: 18029, name: 'Albania' },
      { id: 18094, name: 'Belén de los Andaquíes' },
      { id: 18150, name: 'Cartagena del Chairá' },
    ],
  },
  {
    id: 86,
    name: 'Putumayo',
    cities: [
      { id: 86001, name: 'Mocoa' },
      { id: 86219, name: 'Colón' },
      { id: 86573, name: 'Orito' },
      { id: 86755, name: 'Puerto Asís' },
    ],
  },
  {
    id: 27,
    name: 'Chocó',
    cities: [
      { id: 27001, name: 'Quibdó' },
      { id: 27006, name: 'Acandí' },
      { id: 27025, name: 'Alto Baudó' },
      { id: 27250, name: 'Istmina' },
      { id: 27615, name: 'Tadó' },
    ],
  },
  {
    id: 88,
    name: 'San Andrés y Providencia',
    cities: [
      { id: 88001, name: 'San Andrés' },
      { id: 88564, name: 'Providencia' },
    ],
  },
  {
    id: 91,
    name: 'Amazonas',
    cities: [
      { id: 91001, name: 'Leticia' },
      { id: 91263, name: 'El Encanto' },
      { id: 91405, name: 'La Chorrera' },
      { id: 91407, name: 'La Pedrera' },
    ],
  },
  {
    id: 94,
    name: 'Guainía',
    cities: [
      { id: 94001, name: 'Inírida' },
      { id: 94343, name: 'Barranco Minas' },
      { id: 94888, name: 'Mapiripana' },
    ],
  },
  {
    id: 95,
    name: 'Guaviare',
    cities: [
      { id: 95001, name: 'San José del Guaviare' },
      { id: 95015, name: 'Calamar' },
      { id: 95025, name: 'El Retorno' },
      { id: 95200, name: 'Miraflores' },
    ],
  },
  {
    id: 97,
    name: 'Vaupés',
    cities: [
      { id: 97001, name: 'Mitú' },
      { id: 97161, name: 'Carurú' },
      { id: 97666, name: 'Taraira' },
    ],
  },
  {
    id: 99,
    name: 'Vichada',
    cities: [
      { id: 99001, name: 'Puerto Carreño' },
      { id: 99524, name: 'La Primavera' },
      { id: 99624, name: 'Santa Rosalía' },
    ],
  },
];

/** Todas las ciudades en un array plano (para búsqueda rápida por id) */
export const allCities = colombiaDepartments.flatMap((d) =>
  d.cities.map((c) => ({ ...c, departmentName: d.name }))
);

/** Buscar ciudad por id (acepta number o string, p. ej. código DANE) */
export function getCityById(cityId) {
  if (cityId == null) return undefined;
  return allCities.find((c) => String(c.id) === String(cityId));
}
