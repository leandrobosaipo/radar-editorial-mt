import { DashboardData } from "@/types/dashboard";

const now = new Date();
const cuiabaOffset = -4 * 60;
const cuiabaTime = new Date(now.getTime() + (now.getTimezoneOffset() + cuiabaOffset) * 60000);

function makeTime(minutesAgo: number): string {
  const t = new Date(cuiabaTime.getTime() - minutesAgo * 60000);
  return t.toISOString();
}

function formatCuiaba(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { timeZone: "America/Cuiaba" });
}

export const MOCK_DATA: DashboardData = {
  lastUpdate: cuiabaTime.toISOString(),
  monitoringWindow: "Últimas 6 horas",
  portals: [
    {
      name: "MT Notícias",
      url: "https://mtnoticias.com.br",
      totalPublications: 23,
      status: "OK",
      categories: [
        { name: "Política", count: 8, lastPost: makeTime(12), status: "OK" },
        { name: "Economia", count: 6, lastPost: makeTime(25), status: "OK" },
        { name: "Esportes", count: 5, lastPost: makeTime(45), status: "OK" },
        { name: "Cultura", count: 4, lastPost: makeTime(30), status: "OK" },
      ],
      journalists: [
        { name: "Ana Silva", count: 7, categories: ["Política", "Economia"] },
        { name: "Carlos Souza", count: 6, categories: ["Esportes"] },
        { name: "Maria Lima", count: 5, categories: ["Cultura", "Política"] },
        { name: "João Santos", count: 5, categories: ["Economia"] },
      ],
      latestPosts: [
        { title: "Governo anuncia novo pacote de investimentos para infraestrutura", author: "Ana Silva", datetime: makeTime(12), link: "#", category: "Política", portal: "MT Notícias" },
        { title: "Cuiabá EC vence clássico e assume liderança do estadual", author: "Carlos Souza", datetime: makeTime(25), link: "#", category: "Esportes", portal: "MT Notícias" },
        { title: "Festival de música reúne artistas locais no Parque das Águas", author: "Maria Lima", datetime: makeTime(30), link: "#", category: "Cultura", portal: "MT Notícias" },
      ],
    },
    {
      name: "Gazeta Digital",
      url: "https://gazetadigital.com.br",
      totalPublications: 15,
      status: "ATRASO",
      categories: [
        { name: "Política", count: 5, lastPost: makeTime(15), status: "OK" },
        { name: "Segurança", count: 4, lastPost: makeTime(90), status: "ATRASO" },
        { name: "Saúde", count: 3, lastPost: makeTime(120), status: "ATRASO" },
        { name: "Educação", count: 3, lastPost: makeTime(40), status: "OK" },
      ],
      journalists: [
        { name: "Pedro Oliveira", count: 5, categories: ["Política"] },
        { name: "Lucia Mendes", count: 4, categories: ["Segurança", "Saúde"] },
        { name: "Roberto Costa", count: 6, categories: ["Educação", "Política"] },
      ],
      latestPosts: [
        { title: "Operação policial apreende drogas na região metropolitana", author: "Lucia Mendes", datetime: makeTime(90), link: "#", category: "Segurança", portal: "Gazeta Digital" },
        { title: "Novo hospital regional deve ser inaugurado em março", author: "Lucia Mendes", datetime: makeTime(120), link: "#", category: "Saúde", portal: "Gazeta Digital" },
        { title: "Assembleia vota projeto de lei sobre saneamento básico", author: "Pedro Oliveira", datetime: makeTime(15), link: "#", category: "Política", portal: "Gazeta Digital" },
      ],
    },
    {
      name: "Olhar Direto",
      url: "https://olhardireto.com.br",
      totalPublications: 31,
      status: "OK",
      categories: [
        { name: "Geral", count: 12, lastPost: makeTime(5), status: "OK" },
        { name: "Política", count: 8, lastPost: makeTime(18), status: "OK" },
        { name: "Economia", count: 6, lastPost: makeTime(35), status: "OK" },
        { name: "Entretenimento", count: 5, lastPost: makeTime(22), status: "OK" },
      ],
      journalists: [
        { name: "Fernanda Alves", count: 10, categories: ["Geral", "Política"] },
        { name: "Marcos Ribeiro", count: 9, categories: ["Economia", "Geral"] },
        { name: "Camila Ferreira", count: 7, categories: ["Entretenimento"] },
        { name: "Thiago Barros", count: 5, categories: ["Política", "Geral"] },
      ],
      latestPosts: [
        { title: "Temperaturas devem ultrapassar 40°C nesta semana em Cuiabá", author: "Fernanda Alves", datetime: makeTime(5), link: "#", category: "Geral", portal: "Olhar Direto" },
        { title: "Prefeito anuncia recapeamento de vias no centro histórico", author: "Thiago Barros", datetime: makeTime(18), link: "#", category: "Política", portal: "Olhar Direto" },
      ],
    },
  ],
  audit: [
    { site: "Gazeta Digital", category: "Segurança", lastPublication: makeTime(90), elapsed: "1h 30min atrás", status: "ATRASO" },
    { site: "Gazeta Digital", category: "Saúde", lastPublication: makeTime(120), elapsed: "2h atrás", status: "ATRASO" },
  ],
};
