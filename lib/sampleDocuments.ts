export interface DocumentPreset {
  id: string;
  title: string;
  era: string;
  description: string;
  documents: {
    id: number;
    title: string;
    text: string;
  }[];
}

export const SAMPLE_PRESETS: DocumentPreset[] = [
  {
    id: "amasya-1919",
    title: "Amasya Genelgesi ve İstanbul'un Tepkisi (Haziran 1919)",
    era: "Haziran 1919",
    description: "Milli Mücadele'nin gerekçesi, amacı ve yönteminin ilan edildiği genelge ve sarayın telgrafı.",
    documents: [
      {
        id: 1,
        title: "Amasya Genelgesi Metni (22 Haziran 1919)",
        text: `Vatanın bütünlüğü, milletin bağımsızlığı tehlikededir. İstanbul Hükûmeti, üzerine aldığı sorumluluğun gereklerini yerine getirememektedir. Bu durum milletimizi yok olmuş gibi göstermektedir. Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır. Milletin haklarını dünyaya duyurmak için her türlü tesir ve denetimden uzak millî bir heyetin varlığı zaruridir. Sivas'ta millî bir kongre toplanacaktır; her ilden milletin güvenini kazanmış üç temsilcinin derhal yola çıkarılması gerekmektedir.`
      },
      {
        id: 2,
        title: "Dahiliye Nazırı Ali Kemal Bey'in Vilayetlere Telgrafı (23 Haziran 1919)",
        text: `Mustafa Kemal Paşa azledilmiştir ve ordu müfettişliği vazifesi sona ermiştir. Kendisiyle hiçbir resmî muameleye girişilmeyecek, vilayet işlerinde emir ve tebligatı katiyen dinlenmeyecektir. Devlet işlerinin idaresi ve asayişin temini yalnızca meşru hükümet memurlarına aittir.`
      },
      {
        id: 3,
        title: "Mustafa Kemal Paşa'nın Kolordulara Tamimi (25 Haziran 1919)",
        text: `Milletin bağımsızlığını ve mukaddes haklarını kurtarmak uğrunda milletle beraber sonuna kadar mücadele edeceğime mukaddesatım namına söz verdim. Hiçbir menfi tesire ve şahsi emre boyun eğilmeyecek, milletin sinesinde bir fert olarak çalışmaya devam olunacaktır.`
      }
    ]
  },
  {
    id: "sivas-1919",
    title: "Sivas Kongresi Kararları ve Sadrazam Beyanatı (Eylül 1919)",
    era: "Eylül 1919",
    description: "Tüm cemiyetlerin birleştiği, manda ve himayenin kesin reddedildiği kongre.",
    documents: [
      {
        id: 1,
        title: "Sivas Kongresi Kararları (11 Eylül 1919)",
        text: `Millî sınırlar içinde bulunan vatan parçaları bir bütündür; birbirinden ayrılamaz. Her türlü yabancı işgal ve müdahalesine karşı millet topyekûn kendisini müdafaa edecektir. Kuva-yı Milliyeyi tek kuvvet tanımak ve millî iradeyi hâkim kılmak esastır. Manda ve himaye kabul olunamaz. Bütün millî cemiyetler "Anadolu ve Rumeli Müdafaa-i Hukuk Cemiyeti" adı altında birleştirilmiştir.`
      },
      {
        id: 2,
        title: "Sadrazam Damat Ferit Paşa'nın Hükümet Beyannamesi (15 Eylül 1919)",
        text: `Anadolu'da tertip edilen bu kongre ve teşebbüsler kanun dışıdır ve saltanat makamına karşı bir isyan mahiyetindedir. Padişahımızın iradesine aykırı hareket edenler vatana hıyanet içindedir. Asker ve mülki erkanın bu gibi asilere hiçbir yardımda bulunmaması katiyetle emrolunur.`
      }
    ]
  },
  {
    id: "mondros-1918",
    title: "Mondros Mütarekesi ve İtiraz Raporu (Ekim - Kasım 1918)",
    era: "Ekim 1918",
    description: "Osmanlı ordusunun terhis ve stratejik noktaların işgal şartlarını içeren mütareke.",
    documents: [
      {
        id: 1,
        title: "Mondros Ateşkes Antlaşması Maddeleri (30 Ekim 1918)",
        text: `Madde 7: İtilaf Devletleri, güvenliklerini tehdit edecek bir durum ortaya çıkarsa herhangi bir stratejik noktayı işgal etme hakkına sahip olacaktır. Madde 24: Vilayet-i Sitte'de (altı doğu vilayeti) karışıklık çıkarsa buralar işgal edilebilecektir. Osmanlı orduları derhal terhis edilecek, cephane ve silahlar İtilaf temsilcilerine teslim olunacaktır. Bütün haberleşme ve demiryolu hatları denetim altına alınacaktır.`
      },
      {
        id: 2,
        title: "Mustafa Kemal Paşa'nın Sadrazam İzzet Paşa'ya Telgrafı (3 Kasım 1918)",
        text: `İngilizlerin niyet ve hedefleri açıktır. 7. maddeye dayanarak her gün yeni bir bahaneyle vatan topraklarını fiilen işgale kalkışacaklardır. Ordunun elindeki silah ve cephaneyi kayıtsız şartsız teslim etmek ve kuvvetlerimizi terhis etmek vatanın geleceğini düşmanın merhametine bırakmak demektir.`
      }
    ]
  }
];
