/* ============================================================
   でんしゃすごろく — 路線ネットワークデータ
   pax: 1日あたり乗車人員の概算（万人）。ゲーム内の収益係数として使用。
        実数の厳密値ではなく、駅の規模感を再現するための概算値。
   ============================================================ */

/* ---------- 駅 ---------- */
const S = {};
function st(id, kanji, kana, pax, fun) {
  S[id] = { id, kanji, kana, pax, fun: fun || '', lines: [] };
}

/* 山手線 */
st('tokyo','東京','とうきょう',39,'しんかんせんが たくさん あつまる えき');
st('yurakucho','有楽町','ゆうらくちょう',14);
st('shimbashi','新橋','しんばし',23,'ほんものの じょうききかんしゃが おいてある');
st('hamamatsucho','浜松町','はままつちょう',14,'モノレールで くうこうに いける');
st('tamachi','田町','たまち',10);
st('takanawa','高輪ゲートウェイ','たかなわゲートウェイ',1,'2020ねんに できた あたらしい えき');
st('shinagawa','品川','しながわ',29,'しんかんせんも とまる おおきな えき');
st('osaki','大崎','おおさき',12,'りんかいせんに のりかえできる');
st('gotanda','五反田','ごたんだ',8);
st('meguro','目黒','めぐろ',6);
st('ebisu','恵比寿','えびす',13);
st('shibuya','渋谷','しぶや',27,'ハチこうの どうぞうが ある');
st('harajuku','原宿','はらじゅく',7);
st('yoyogi','代々木','よよぎ',6);
st('shinjuku','新宿','しんじゅく',76,'せかいで いちばん のる人が おおい えき');
st('shinokubo','新大久保','しんおおくぼ',4);
st('takadanobaba','高田馬場','たかだのばば',18);
st('mejiro','目白','めじろ',4);
st('ikebukuro','池袋','いけぶくろ',56,'ふくろうの マスコットが いる');
st('otsuka','大塚','おおつか',5,'とでん あらかわせんに のりかえできる');
st('sugamo','巣鴨','すがも',7);
st('komagome','駒込','こまごめ',4);
st('tabata','田端','たばた',4);
st('nishinippori','西日暮里','にしにっぽり',8);
st('nippori','日暮里','にっぽり',9);
st('uguisudani','鶯谷','うぐいすだに',2);
st('ueno','上野','うえの',16,'どうぶつえんに パンダが いる');
st('okachimachi','御徒町','おかちまち',6);
st('akihabara','秋葉原','あきはばら',23,'でんきの まち');
st('kanda','神田','かんだ',10);

/* 京浜東北線 北側 */
st('omiya','大宮','おおみや',24,'てつどうはくぶつかんが ある！');
st('saitamashintoshin','さいたま新都心','さいたましんとしん',6);
st('yono','与野','よの',2);
st('kitaurawa','北浦和','きたうらわ',3);
st('urawa','浦和','うらわ',9);
st('minamiurawa','南浦和','みなみうらわ',6);
st('warabi','蕨','わらび',5);
st('nishikawaguchi','西川口','にしかわぐち',4);
st('kawaguchi','川口','かわぐち',8,'さいきょうせんは ここを とおらないよ');
st('akabane','赤羽','あかばね',9,'のりかえの たつじん えき');
st('higashijujo','東十条','ひがしじゅうじょう',2);
st('oji','王子','おうじ',5);
st('kaminakazato','上中里','かみなかざと',1);

/* 京浜東北線 南側 */
st('oimachi','大井町','おおいまち',7);
st('omori','大森','おおもり',5);
st('kamata','蒲田','かまた',7);
st('kawasaki','川崎','かわさき',19);
st('tsurumi','鶴見','つるみ',4);
st('shinkoyasu','新子安','しんこやす',1);
st('higashikanagawa','東神奈川','ひがしかながわ',3);
st('yokohama','横浜','よこはま',38,'みなとの まちの おおきな えき');

/* 埼京線 */
st('kitayono','北与野','きたよの',1);
st('yonohoncho','与野本町','よのほんちょう',1);
st('minamiyono','南与野','みなみよの',2);
st('nakaurawa','中浦和','なかうらわ',1);
st('musashiurawa','武蔵浦和','むさしうらわ',5);
st('kitatoda','北戸田','きたとだ',2);
st('toda','戸田','とだ',2);
st('todakoen','戸田公園','とだこうえん',3);
st('ukimafunado','浮間舟渡','うきまふなど',1);
st('kitaakabane','北赤羽','きたあかばね',1);
st('jujo','十条','じゅうじょう',2);
st('itabashi','板橋','いたばし',2);

/* 湘南新宿ライン 南側 */
st('nishioi','西大井','にしおおい',2);
st('musashikosugi','武蔵小杉','むさしこすぎ',13);
st('totsuka','戸塚','とつか',11);
st('ofuna','大船','おおふな',10);

/* 宇都宮線・高崎線 */
st('oku','尾久','おく',0.5);
st('toro','土呂','とろ',1);
st('higashiomiya','東大宮','ひがしおおみや',2);
st('hasuda','蓮田','はすだ',1);
st('shiraoka','白岡','しらおか',1);
st('kuki','久喜','くき',2);
st('miyahara','宮原','みやはら',2);
st('ageo','上尾','あげお',4);
st('kitaageo','北上尾','きたあげお',1);
st('okegawa','桶川','おけがわ',2);
st('kitamoto','北本','きたもと',1);
st('konosu','鴻巣','こうのす',1);
st('kumagaya','熊谷','くまがや',3,'しんかんせんも とまる えき');
st('takasaki','高崎','たかさき',2);

/* 中央線 */
st('ochanomizu','御茶ノ水','おちゃのみず',10);
st('yotsuya','四ツ谷','よつや',9);
st('nakano','中野','なかの',12);
st('koenji','高円寺','こうえんじ',4);
st('asagaya','阿佐ヶ谷','あさがや',4);
st('ogikubo','荻窪','おぎくぼ',8);
st('nishiogikubo','西荻窪','にしおぎくぼ',4);
st('kichijoji','吉祥寺','きちじょうじ',13,'いのかしらこうえんの どうぶつえん');
st('mitaka','三鷹','みたか',9);
st('musashisakai','武蔵境','むさしさかい',3);
st('higashikoganei','東小金井','ひがしこがねい',2);
st('musashikoganei','武蔵小金井','むさしこがねい',3);
st('kokubunji','国分寺','こくぶんじ',6);
st('nishikokubunji','西国分寺','にしこくぶんじ',2);
st('kunitachi','国立','くにたち',3);
st('tachikawa','立川','たちかわ',15);
st('hino','日野','ひの',1);
st('toyoda','豊田','とよだ',2);
st('hachioji','八王子','はちおうじ',8);
st('nishihachioji','西八王子','にしはちおうじ',2);
st('takao','高尾','たかお',1,'たかおさんに のぼれる');

/* 中央・総武線 各駅停車 */
st('higashinakano','東中野','ひがしなかの',2);
st('okubo','大久保','おおくぼ',2);
st('sendagaya','千駄ヶ谷','せんだがや',1);
st('shinanomachi','信濃町','しなのまち',2);
st('ichigaya','市ケ谷','いちがや',4);
st('iidabashi','飯田橋','いいだばし',7);
st('suidobashi','水道橋','すいどうばし',4);
st('asakusabashi','浅草橋','あさくさばし',3);
st('ryogoku','両国','りょうごく',2,'おすもうさんの こくぎかんが ある');
st('kinshicho','錦糸町','きんしちょう',6);
st('kameido','亀戸','かめいど',3);
st('hirai','平井','ひらい',2);
st('shinkoiwa','新小岩','しんこいわ',3);
st('koiwa','小岩','こいわ',2);
st('ichikawa','市川','いちかわ',4);
st('motoyawata','本八幡','もとやわた',3);
st('shimosanakayama','下総中山','しもうさなかやま',1);
st('nishifunabashi','西船橋','にしふなばし',6);
st('funabashi','船橋','ふなばし',10);
st('higashifunabashi','東船橋','ひがしふなばし',1);
st('tsudanuma','津田沼','つだぬま',5);
st('makuharihongo','幕張本郷','まくはりほんごう',2);
st('makuhari','幕張','まくはり',1);
st('shinkemigawa','新検見川','しんけみがわ',2);
st('inage','稲毛','いなげ',3);
st('nishichiba','西千葉','にしちば',1);
st('chiba','千葉','ちば',10);

/* 京葉線 */
st('hatchobori','八丁堀','はっちょうぼり',3);
st('etchujima','越中島','えっちゅうじま',0.4);
st('shiomi','潮見','しおみ',1);
st('shinkiba','新木場','しんきば',4);
st('kasairinkaikoen','葛西臨海公園','かさいりんかいこうえん',1,'すいぞくえんと かんらんしゃ');
st('maihama','舞浜','まいはま',6,'ゆめの くにの えき！');
st('shinurayasu','新浦安','しんうらやす',3);
st('ichikawashiohama','市川塩浜','いちかわしおはま',0.4);
st('futamatashimmachi','二俣新町','ふたまたしんまち',0.3);
st('minamifunabashi','南船橋','みなみふなばし',2);
st('shinnarashino','新習志野','しんならしの',1);
st('makuharitoyosuna','幕張豊砂','まくはりとよすな',0.5,'2023ねんに できたばかりの えき');
st('kaihimmakuhari','海浜幕張','かいひんまくはり',6,'やきゅうじょうが ある');
st('kemigawahama','検見川浜','けみがわはま',1);
st('inagekaigan','稲毛海岸','いなげかいがん',2);
st('chibaminato','千葉みなと','ちばみなと',1);
st('soga','蘇我','そが',1);

/* 東海道線 */
st('fujisawa','藤沢','ふじさわ',9);
st('tsujido','辻堂','つじどう',4);
st('chigasaki','茅ヶ崎','ちがさき',5);
st('hiratsuka','平塚','ひらつか',6);
st('oiso','大磯','おおいそ',0.6);
st('ninomiya','二宮','にのみや',0.8);
st('kozu','国府津','こうづ',0.5);
st('kamonomiya','鴨宮','かものみや',1);
st('odawara','小田原','おだわら',3,'おしろと しんかんせんが ある');

/* りんかい線 */
st('shinagawaseaside','品川シーサイド','しながわシーサイド',1);
st('tennozuisle','天王洲アイル','てんのうずアイル',1);
st('tokyoteleport','東京テレポート','とうきょうテレポート',2,'おだいばの えき');
st('kokusaitenjijo','国際展示場','こくさいてんじじょう',2);
st('shinonome','東雲','しののめ',1);
st('tatsumi','辰巳','たつみ',1);

/* 相鉄線 */
st('hazawa','羽沢横浜国大','はざわよこはまこくだい',0.5,'JRと そうてつの さかいめ。2019ねんに できた');
st('nishiya','西谷','にしや',1);
st('tsurugamine','鶴ヶ峰','つるがみね',2);
st('futamatagawa','二俣川','ふたまたがわ',3);
st('kibogaoka','希望ヶ丘','きぼうがおか',1);
st('mitsukyo','三ツ境','みつきょう',2);
st('seya','瀬谷','せや',2);
st('yamato','大和','やまと',5);
st('sagamiotsuka','相模大塚','さがみおおつか',0.5);
st('sagamino','さがみ野','さがみの',1);
st('kashiwadai','かしわ台','かしわだい',1);
st('ebina','海老名','えびな',6,'そうてつと おだきゅうが であう えき');

/* 小田急小田原線 */
st('yoyogiuehara','代々木上原','よよぎうえはら',5);
st('shimokitazawa','下北沢','しもきたざわ',10);
st('kyodo','経堂','きょうどう',4);
st('seijogakuenmae','成城学園前','せいじょうがくえんまえ',5);
st('noborito','登戸','のぼりと',4);
st('shinyurigaoka','新百合ヶ丘','しんゆりがおか',6);
st('machida','町田','まちだ',12);
st('sagamiono','相模大野','さがみおおの',6);
st('honatsugi','本厚木','ほんあつぎ',6);
st('isehara','伊勢原','いせはら',2);
st('hadano','秦野','はだの',2);
st('shinmatsuda','新松田','しんまつだ',1);

/* ============================================================
   路線と種別
   stops は「通過駅（skip）」で表現する。停車パターンはおおむね現実に
   準拠させているが、ゲームとして遊べる範囲で細部を簡略化している。
   ============================================================ */
const LINES = {};
function line(id, o) {
  LINES[id] = Object.assign({ id, loop: false }, o);
  o.stations.forEach(sid => {
    if (!S[sid]) throw new Error('未定義の駅: ' + sid + ' (' + id + ')');
    S[sid].lines.push(id);
  });
}
const A = 'all';

line('JK', {
  name: '京浜東北線', kana: 'けいひんとうほくせん', color: '#00B2E5', ink: '#062a3a',
  stations: ['omiya','saitamashintoshin','yono','kitaurawa','urawa','minamiurawa','warabi',
    'nishikawaguchi','kawaguchi','akabane','higashijujo','oji','kaminakazato','tabata',
    'nishinippori','nippori','uguisudani','ueno','okachimachi','akihabara','kanda','tokyo',
    'yurakucho','shimbashi','hamamatsucho','tamachi','takanawa','shinagawa','oimachi','omori',
    'kamata','kawasaki','tsurumi','shinkoyasu','higashikanagawa','yokohama'],
  services: [
    { id:'local', name:'各駅停車', kana:'かくえきていしゃ', cls:'local', skip: [] },
    { id:'rapid', name:'快速',     kana:'かいそく',        cls:'rapid',
      skip: ['nishinippori','uguisudani','okachimachi','kanda','takanawa'] }
  ]
});

line('JY', {
  name: '山手線', kana: 'やまのてせん', color: '#9ACD32', ink: '#26340a', loop: true,
  stations: ['tokyo','kanda','akihabara','okachimachi','ueno','uguisudani','nippori','nishinippori',
    'tabata','komagome','sugamo','otsuka','ikebukuro','mejiro','takadanobaba','shinokubo','shinjuku',
    'yoyogi','harajuku','shibuya','ebisu','meguro','gotanda','osaki','shinagawa','takanawa','tamachi',
    'hamamatsucho','shimbashi','yurakucho'],
  services: [ { id:'local', name:'各駅停車', kana:'かくえきていしゃ', cls:'local', skip: [] } ]
});

line('JA', {
  name: '埼京線', kana: 'さいきょうせん', color: '#00B48D', ink: '#00312a',
  stations: ['omiya','kitayono','yonohoncho','minamiyono','nakaurawa','musashiurawa','kitatoda',
    'toda','todakoen','ukimafunado','kitaakabane','akabane','jujo','itabashi','ikebukuro',
    'shinjuku','shibuya','ebisu','osaki'],
  services: [
    { id:'local', name:'各駅停車', kana:'かくえきていしゃ', cls:'local', skip: [] },
    { id:'rapid', name:'快速',     kana:'かいそく',        cls:'rapid',
      skip: ['jujo','itabashi','kitaakabane','ukimafunado','toda','kitatoda'] },
    { id:'crapid', name:'通勤快速', kana:'つうきんかいそく', cls:'exp',
      skip: ['jujo','itabashi','kitaakabane','ukimafunado','toda','kitatoda',
             'nakaurawa','minamiyono','yonohoncho','kitayono'] }
  ]
});

line('JS', {
  name: '湘南新宿ライン', kana: 'しょうなんしんじゅくライン', color: '#E21F26', ink: '#3a0507',
  stations: ['omiya','urawa','akabane','ikebukuro','shinjuku','shibuya','ebisu','osaki','nishioi',
    'musashikosugi','yokohama','totsuka','ofuna'],
  services: [
    { id:'local', name:'普通', kana:'ふつう',   cls:'local', skip: [] },
    { id:'rapid', name:'快速', kana:'かいそく', cls:'rapid', skip: ['ebisu','osaki'] },
    { id:'srapid', name:'特別快速', kana:'とくべつかいそく', cls:'exp',
      skip: ['ebisu','osaki','nishioi','musashikosugi'] }
  ]
});

line('JU', {
  name: '宇都宮線', kana: 'うつのみやせん', color: '#F68B1E', ink: '#3a2000',
  stations: ['tokyo','ueno','oku','akabane','urawa','saitamashintoshin','omiya','toro',
    'higashiomiya','hasuda','shiraoka','kuki'],
  services: [
    { id:'local', name:'普通', kana:'ふつう', cls:'local', skip: [] },
    { id:'rapid', name:'快速ラビット', kana:'かいそくラビット', cls:'rapid',
      skip: ['oku','toro','higashiomiya','shiraoka'] }
  ]
});

line('JH', {
  name: '高崎線', kana: 'たかさきせん', color: '#F68B1E', ink: '#3a2000',
  stations: ['tokyo','ueno','oku','akabane','urawa','saitamashintoshin','omiya','miyahara','ageo',
    'kitaageo','okegawa','kitamoto','konosu','kumagaya','takasaki'],
  services: [
    { id:'local', name:'普通', kana:'ふつう', cls:'local', skip: [] },
    { id:'rapid', name:'快速アーバン', kana:'かいそくアーバン', cls:'rapid',
      skip: ['oku','miyahara','kitaageo','kitamoto'] }
  ]
});

line('JT', {
  name: '東海道線', kana: 'とうかいどうせん', color: '#F68B1E', ink: '#3a2000',
  stations: ['tokyo','shimbashi','shinagawa','kawasaki','yokohama','totsuka','ofuna','fujisawa',
    'tsujido','chigasaki','hiratsuka','oiso','ninomiya','kozu','kamonomiya','odawara'],
  services: [ { id:'local', name:'普通', kana:'ふつう', cls:'local', skip: [] } ]
});

line('JC', {
  name: '中央線快速', kana: 'ちゅうおうせんかいそく', color: '#F15A22', ink: '#3a1000',
  stations: ['tokyo','kanda','ochanomizu','yotsuya','shinjuku','nakano','koenji','asagaya','ogikubo',
    'nishiogikubo','kichijoji','mitaka','musashisakai','higashikoganei','musashikoganei','kokubunji',
    'nishikokubunji','kunitachi','tachikawa','hino','toyoda','hachioji','nishihachioji','takao'],
  services: [
    { id:'rapid', name:'快速', kana:'かいそく', cls:'rapid', skip: [] },
    { id:'ctokkai', name:'中央特快', kana:'ちゅうおうとっかい', cls:'exp',
      skip: ['koenji','asagaya','ogikubo','nishiogikubo','kichijoji','musashisakai','higashikoganei',
             'musashikoganei','nishikokubunji','kunitachi','hino','toyoda','nishihachioji'] }
  ]
});

line('JB', {
  name: '中央・総武線各駅停車', kana: 'ちゅうおう・そうぶせんかくえきていしゃ',
  color: '#FFD400', ink: '#3a3000',
  stations: ['mitaka','kichijoji','nishiogikubo','ogikubo','asagaya','koenji','nakano','higashinakano',
    'okubo','shinjuku','yoyogi','sendagaya','shinanomachi','yotsuya','ichigaya','iidabashi',
    'suidobashi','ochanomizu','akihabara','asakusabashi','ryogoku','kinshicho','kameido','hirai',
    'shinkoiwa','koiwa','ichikawa','motoyawata','shimosanakayama','nishifunabashi','funabashi',
    'higashifunabashi','tsudanuma','makuharihongo','makuhari','shinkemigawa','inage','nishichiba','chiba'],
  services: [ { id:'local', name:'各駅停車', kana:'かくえきていしゃ', cls:'local', skip: [] } ]
});

line('JE', {
  name: '京葉線', kana: 'けいようせん', color: '#C9252F', ink: '#3a060a',
  stations: ['tokyo','hatchobori','etchujima','shiomi','shinkiba','kasairinkaikoen','maihama',
    'shinurayasu','ichikawashiohama','futamatashimmachi','minamifunabashi','shinnarashino',
    'makuharitoyosuna','kaihimmakuhari','kemigawahama','inagekaigan','chibaminato','soga'],
  services: [
    { id:'local', name:'各駅停車', kana:'かくえきていしゃ', cls:'local', skip: [] },
    { id:'rapid', name:'快速', kana:'かいそく', cls:'rapid',
      skip: ['etchujima','shiomi','kasairinkaikoen','ichikawashiohama','futamatashimmachi',
             'shinnarashino','makuharitoyosuna'] }
  ]
});

line('R', {
  name: 'りんかい線', kana: 'りんかいせん', color: '#00A7DB', ink: '#052836',
  stations: ['osaki','oimachi','shinagawaseaside','tennozuisle','tokyoteleport','kokusaitenjijo',
    'shinonome','tatsumi','shinkiba'],
  services: [ { id:'local', name:'各駅停車', kana:'かくえきていしゃ', cls:'local', skip: [] } ]
});

line('SO', {
  name: '相鉄線', kana: 'そうてつせん', color: '#003686', ink: '#001231',
  stations: ['osaki','nishioi','musashikosugi','hazawa','nishiya','tsurugamine','futamatagawa',
    'kibogaoka','mitsukyo','seya','yamato','sagamiotsuka','sagamino','kashiwadai','ebina'],
  services: [
    { id:'local', name:'各駅停車', kana:'かくえきていしゃ', cls:'local', skip: [] },
    { id:'ltd', name:'特急', kana:'とっきゅう', cls:'exp',
      skip: ['nishioi','tsurugamine','kibogaoka','mitsukyo','seya','sagamiotsuka','sagamino','kashiwadai'] }
  ]
});

line('OH', {
  name: '小田急小田原線', kana: 'おだきゅうおだわらせん', color: '#0067C0', ink: '#00203c',
  stations: ['shinjuku','yoyogiuehara','shimokitazawa','kyodo','seijogakuenmae','noborito',
    'shinyurigaoka','machida','sagamiono','ebina','honatsugi','isehara','hadano','shinmatsuda','odawara'],
  services: [
    { id:'local', name:'各駅停車', kana:'かくえきていしゃ', cls:'local', skip: [] },
    { id:'exp', name:'急行', kana:'きゅうこう', cls:'rapid', skip: ['kyodo'] },
    { id:'rexp', name:'快速急行', kana:'かいそくきゅうこう', cls:'exp', skip: ['kyodo','seijogakuenmae'] },
    { id:'romance', name:'特急ロマンスカー', kana:'とっきゅうロマンスカー', cls:'ltd',
      skip: ['yoyogiuehara','shimokitazawa','kyodo','seijogakuenmae','noborito','shinyurigaoka',
             'sagamiono','ebina','isehara','shinmatsuda'] }
  ]
});

/* 直通運転（乗り換えても電車を降りなくてよい＝のりかえコスト 0） */
const THROUGH = [
  { a:'JA', b:'R',  at:'osaki', note:'さいきょうせんは そのまま りんかいせんに はいるよ' },
  { a:'JA', b:'SO', at:'osaki', note:'さいきょうせんは そのまま そうてつせんに はいるよ' },
  { a:'JU', b:'JT', at:'tokyo', note:'うえのとうきょうラインで そのまま とうかいどうせんへ' },
  { a:'JH', b:'JT', at:'tokyo', note:'うえのとうきょうラインで そのまま とうかいどうせんへ' }
];

/* ============================================================
   車両（図鑑カード）
   body: 車体色 / band: 帯（上から順）/ face: 前面の色
   rarity: 1=よく見る 2=ときどき 3=レア
   ============================================================ */
const TRAINS = [
  { id:'E235-0',   name:'E235系 0番台',   kana:'E235けい',   lines:['JY'],
    body:'#e9edf1', face:'#15181d', band:['#9ACD32','#2e7d32'], rarity:1,
    note:'やまのてせんの でんしゃ。まどが おおきくて、なかの がめんも おおきい' },
  { id:'E233-1000',name:'E233系 1000番台',kana:'E233けい 1000ばんだい',lines:['JK'],
    body:'#e9edf1', face:'#15181d', band:['#00B2E5','#0067C0'], rarity:1,
    note:'けいひんとうほくせんの でんしゃ。みずいろの おび' },
  { id:'E233-7000',name:'E233系 7000番台',kana:'E233けい 7000ばんだい',lines:['JA'],
    body:'#e9edf1', face:'#15181d', band:['#00B48D','#006e58'], rarity:1,
    note:'さいきょうせんの でんしゃ。りんかいせんや そうてつせんにも はいっていく' },
  { id:'70-000',   name:'70-000形',       kana:'70-000がた',      lines:['R'],
    body:'#e9edf1', face:'#1b2a33', band:['#00A7DB','#8ad3ef'], rarity:2,
    note:'りんかいせんの でんしゃ。おだいばの ちかを はしる' },
  { id:'SO-12000', name:'相鉄 12000系',   kana:'そうてつ 12000けい', lines:['SO'],
    body:'#003686', face:'#001b45', band:['#c9d6e8'], rarity:3,
    note:'よこはまネイビーブルーの でんしゃ。しんじゅくから えびなまで はしる' },
  { id:'SO-20000', name:'相鉄 20000系',   kana:'そうてつ 20000けい', lines:['SO'],
    body:'#003686', face:'#001b45', band:['#c9d6e8','#7f95b8'], rarity:3,
    note:'そうてつの あたらしい でんしゃ。とうきゅうせんにも はいる' },
  { id:'E231-1000',name:'E231系 1000番台',kana:'E231けい 1000ばんだい', lines:['JS','JU','JH','JT'],
    body:'#e9edf1', face:'#15181d', band:['#F68B1E','#00A650'], rarity:1,
    note:'オレンジと みどりの おび。しょうなんしんじゅくラインや うつのみやせんを はしる' },
  { id:'E233-3000',name:'E233系 3000番台',kana:'E233けい 3000ばんだい',lines:['JS','JU','JH','JT'],
    body:'#e9edf1', face:'#15181d', band:['#F68B1E','#00A650'], rarity:2,
    note:'E231けいの あとに つくられた、ながい きょりを はしる でんしゃ' },
  { id:'E233-0',   name:'E233系 0番台',   kana:'E233けい 0ばんだい',lines:['JC'],
    body:'#e9edf1', face:'#15181d', band:['#F15A22'], rarity:1,
    note:'ちゅうおうせんの オレンジの でんしゃ' },
  { id:'E231-0',   name:'E231系 0番台',   kana:'E231けい 0ばんだい', lines:['JB'],
    body:'#e9edf1', face:'#15181d', band:['#FFD400','#0067C0'], rarity:1,
    note:'そうぶせんの きいろい でんしゃ' },
  { id:'E231-500', name:'E231系 500番台', kana:'E231けい 500ばんだい', lines:['JB'],
    body:'#e9edf1', face:'#15181d', band:['#FFD400','#0067C0'], rarity:2,
    note:'もとは やまのてせんを はしっていた でんしゃ。いまは そうぶせんに いる' },
  { id:'E233-5000',name:'E233系 5000番台',kana:'E233けい 5000ばんだい',lines:['JE'],
    body:'#e9edf1', face:'#15181d', band:['#C9252F','#f0a0a5'], rarity:2,
    note:'けいようせんの あかい でんしゃ。まいはまに いける' },
  { id:'OH-8000',  name:'小田急 8000形',  kana:'おだきゅう 8000がた', lines:['OH'],
    body:'#f4f4f0', face:'#2b2b2b', band:['#0067C0'], rarity:2,
    note:'おだきゅうの しろい でんしゃ。あおい おびが 1ぽん' },
  { id:'OH-3000',  name:'小田急 3000形',  kana:'おだきゅう 3000がた', lines:['OH'],
    body:'#f4f4f0', face:'#2b2b2b', band:['#0067C0','#9fc8ea'], rarity:1,
    note:'おだきゅうで いちばん たくさん いる でんしゃ' },
  { id:'OH-5000',  name:'小田急 5000形',  kana:'おだきゅう 5000がた', lines:['OH'],
    body:'#ffffff', face:'#1d3f6b', band:['#0067C0'], rarity:2,
    note:'2020ねんに でてきた、はばの ひろい あたらしい でんしゃ' },
  { id:'OH-70000', ltd:true, name:'小田急 70000形 GSE', kana:'ロマンスカー GSE', lines:['OH'],
    body:'#E8383D', face:'#b81f26', band:['#ffffff'], rarity:3,
    note:'ロマンスカー。いちばん まえの せきから せんろが まるみえ！' },
  { id:'OH-60000', ltd:true, name:'小田急 60000形 MSE', kana:'ロマンスカー MSE', lines:['OH'],
    body:'#f4f4f0', face:'#1b4f8a', band:['#0067C0','#E8383D'], rarity:3,
    note:'ちかてつにも はいれる ロマンスカー' },
  { id:'OH-30000', ltd:true, name:'小田急 30000形 EXEα', kana:'ロマンスカー EXEアルファ', lines:['OH'],
    body:'#d9cfc0', face:'#6b5a46', band:['#a8492f'], rarity:3,
    note:'いろが ちゃいろっぽい ロマンスカー' }
];

/* ============================================================
   スタンプ（＝物件）の絵柄
   ============================================================ */
const STAMPS = [
  { id:'soba',  emoji:'🍜', name:'えきそば',   kana:'えきそば' },
  { id:'shop',  emoji:'🍙', name:'うりば',     kana:'うりば' },
  { id:'bread', emoji:'🥐', name:'パンやさん', kana:'パンやさん' },
  { id:'cafe',  emoji:'☕', name:'カフェ',     kana:'カフェ' },
  { id:'gift',  emoji:'🎁', name:'おみやげや', kana:'おみやげや' },
  { id:'ice',   emoji:'🍦', name:'アイスやさん', kana:'アイスやさん' }
];

/* ============================================================
   おでかけミッション（協力モード）
   from: スタート駅 / goals: 順番に回る目的駅
   ============================================================ */
const MISSIONS = [
  { id:'m1', title:'あかばねで のりかえて しんじゅくへ', kana:'あかばねで のりかえて しんじゅくへ',
    from:'kawaguchi', goals:['shinjuku'], level:1,
    hint:'さいきょうせんは かわぐちを とおらないよ。まず あかばねまで いこう' },
  { id:'m2', title:'てつどうはくぶつかんへ（大宮）', kana:'てつどうはくぶつかんへ',
    from:'kawaguchi', goals:['omiya'], level:1,
    hint:'けいひんとうほくせんで きたへ すすむか、あかばねで はやい でんしゃに のりかえると ぐんと ちかづく' },
  { id:'m3', title:'うえのどうぶつえんと あきはばら', kana:'うえのどうぶつえんと あきはばら',
    from:'akabane', goals:['ueno','akihabara'], level:1,
    hint:'うえのから あきはばらは とても ちかいよ' },
  { id:'m4', title:'ゆめの くに まいはまへ', kana:'ゆめの くに まいはまへ',
    from:'kawaguchi', goals:['tokyo','maihama'], level:2,
    hint:'とうきょうえきから けいようせんに のりかえ。ホームが とおいから じかんが かかる' },
  { id:'m5', title:'おだいばで あそぶ', kana:'おだいばで あそぶ',
    from:'akabane', goals:['osaki','tokyoteleport'], level:2,
    hint:'さいきょうせんは おおさきから そのまま りんかいせんに はいるよ' },
  { id:'m6', title:'よこはま みなとめぐり', kana:'よこはま みなとめぐり',
    from:'omiya', goals:['ikebukuro','yokohama'], level:2,
    hint:'しょうなんしんじゅくラインが はやい' },
  { id:'m7', title:'たかおさんに のぼる', kana:'たかおさんに のぼる',
    from:'kawaguchi', goals:['shinjuku','takao'], level:3,
    hint:'しんじゅくから ちゅうおうとっかいに のると ぐんと すすむ' },
  { id:'m8', title:'ロマンスカーで おだわらじょうへ', kana:'ロマンスカーで おだわらじょうへ',
    from:'akabane', goals:['shinjuku','odawara'], level:3,
    hint:'しんじゅくから おだきゅうの ロマンスカー。とまる えきが とても すくない' },
  { id:'m9', title:'そうてつせんで えびなまで', kana:'そうてつせんで えびなまで',
    from:'omiya', goals:['osaki','ebina'], level:3,
    hint:'さいきょうせんは そうてつせんにも そのまま はいっていく' },
  { id:'m10',title:'いちにちで とうきょうを ぐるり', kana:'いちにちで とうきょうを ぐるり',
    from:'kawaguchi', goals:['ikebukuro','shibuya','tokyo','omiya'], level:3,
    hint:'やまのてせんは ぐるぐる まわる。ちかい むきを えらぼう' }
];

/* 目的地に着いたときの ごほうびコメント */
const GOAL_JOY = {
  omiya:'てつどうはくぶつかんで ほんものの しんかんせんを みた！',
  maihama:'ゆめの くにに とうちゃく！',
  ueno:'パンダに あえた！',
  takao:'たかおさんの ちょうじょうまで のぼった！',
  odawara:'おだわらじょうの てんしゅに のぼった！',
  tokyoteleport:'おだいばで うみを みた！',
  yokohama:'みなとで おおきな ふねを みた！',
  shinjuku:'せかいで いちばん ひとが おおい えきに とうちゃく！',
  ikebukuro:'ふくろうの マスコットに あえた！',
  ebina:'そうてつの ネイビーブルーの でんしゃを みた！',
  shibuya:'ハチこうに あいさつした！',
  tokyo:'しんかんせんが ならんでいるのを みた！',
  akihabara:'でんしゃの もけいを みた！',
  kasairinkaikoen:'かんらんしゃに のった！',
  kaihimmakuhari:'やきゅうを みた！'
};

/* ============================================================
   駅の位置（およその緯度・経度）
   全体マップを描くための座標。実測値ではなく概算だが、
   方角と位置関係（大宮は北、横浜は南、八王子は西、千葉は東）は
   実際どおりになるようにしてある。
   ============================================================ */
const POS = {
  /* 山手線 */
  tokyo:[35.6812,139.7671], yurakucho:[35.6750,139.7632], shimbashi:[35.6662,139.7583],
  hamamatsucho:[35.6553,139.7570], tamachi:[35.6457,139.7476], takanawa:[35.6357,139.7405],
  shinagawa:[35.6285,139.7387], osaki:[35.6197,139.7286], gotanda:[35.6262,139.7233],
  meguro:[35.6339,139.7157], ebisu:[35.6467,139.7100], shibuya:[35.6580,139.7016],
  harajuku:[35.6702,139.7027], yoyogi:[35.6830,139.7020], shinjuku:[35.6900,139.7004],
  shinokubo:[35.7013,139.7000], takadanobaba:[35.7123,139.7038], mejiro:[35.7212,139.7065],
  ikebukuro:[35.7295,139.7109], otsuka:[35.7312,139.7286], sugamo:[35.7334,139.7394],
  komagome:[35.7365,139.7468], tabata:[35.7380,139.7608], nishinippori:[35.7320,139.7668],
  nippori:[35.7281,139.7707], uguisudani:[35.7207,139.7787], ueno:[35.7138,139.7770],
  okachimachi:[35.7075,139.7745], akihabara:[35.6984,139.7731], kanda:[35.6918,139.7709],
  /* 京浜東北線 北 */
  omiya:[35.9063,139.6238], saitamashintoshin:[35.8944,139.6329], yono:[35.8830,139.6392],
  kitaurawa:[35.8720,139.6449], urawa:[35.8588,139.6570], minamiurawa:[35.8477,139.6650],
  warabi:[35.8264,139.6800], nishikawaguchi:[35.8147,139.6976], kawaguchi:[35.8074,139.7191],
  akabane:[35.7779,139.7210], higashijujo:[35.7667,139.7240], oji:[35.7554,139.7383],
  kaminakazato:[35.7460,139.7490],
  /* 京浜東北線 南 */
  oimachi:[35.6064,139.7342], omori:[35.5885,139.7280], kamata:[35.5625,139.7160],
  kawasaki:[35.5309,139.6968], tsurumi:[35.5081,139.6760], shinkoyasu:[35.4930,139.6520],
  higashikanagawa:[35.4770,139.6320], yokohama:[35.4657,139.6223],
  /* 埼京線 */
  kitayono:[35.8930,139.6155], yonohoncho:[35.8828,139.6145], minamiyono:[35.8700,139.6120],
  nakaurawa:[35.8565,139.6355], musashiurawa:[35.8477,139.6400], kitatoda:[35.8280,139.6480],
  toda:[35.8180,139.6560], todakoen:[35.8060,139.6690], ukimafunado:[35.7940,139.6820],
  kitaakabane:[35.7880,139.7050], jujo:[35.7620,139.7200], itabashi:[35.7476,139.7190],
  /* 湘南新宿ライン 南 */
  nishioi:[35.5965,139.7190], musashikosugi:[35.5764,139.6597],
  totsuka:[35.4004,139.5340], ofuna:[35.3540,139.5310],
  /* 宇都宮線・高崎線 */
  oku:[35.7530,139.7480], toro:[35.9280,139.6250], higashiomiya:[35.9450,139.6320],
  hasuda:[35.9970,139.6620], shiraoka:[36.0190,139.6770], kuki:[36.0620,139.6670],
  miyahara:[35.9330,139.6030], ageo:[35.9750,139.5930], kitaageo:[35.9880,139.5900],
  okegawa:[36.0030,139.5700], kitamoto:[36.0270,139.5300], konosu:[36.0640,139.5150],
  kumagaya:[36.1390,139.3900], takasaki:[36.3220,139.0130],
  /* 中央線 */
  ochanomizu:[35.6993,139.7650], yotsuya:[35.6860,139.7300], nakano:[35.7057,139.6659],
  koenji:[35.7050,139.6497], asagaya:[35.7048,139.6360], ogikubo:[35.7046,139.6200],
  nishiogikubo:[35.7038,139.5990], kichijoji:[35.7030,139.5800], mitaka:[35.7028,139.5605],
  musashisakai:[35.7020,139.5440], higashikoganei:[35.7010,139.5230],
  musashikoganei:[35.7005,139.5070], kokubunji:[35.7000,139.4800],
  nishikokubunji:[35.6995,139.4650], kunitachi:[35.6990,139.4450], tachikawa:[35.6980,139.4140],
  hino:[35.6810,139.3950], toyoda:[35.6740,139.3780], hachioji:[35.6558,139.3390],
  nishihachioji:[35.6560,139.3130], takao:[35.6420,139.2830],
  /* 中央・総武線 各駅停車 */
  higashinakano:[35.7070,139.6840], okubo:[35.7010,139.6970], sendagaya:[35.6810,139.7120],
  shinanomachi:[35.6800,139.7200], ichigaya:[35.6915,139.7355], iidabashi:[35.7020,139.7450],
  suidobashi:[35.7020,139.7540], asakusabashi:[35.6990,139.7860], ryogoku:[35.6960,139.7930],
  kinshicho:[35.6970,139.8140], kameido:[35.6970,139.8270], hirai:[35.7070,139.8430],
  shinkoiwa:[35.7170,139.8580], koiwa:[35.7330,139.8820], ichikawa:[35.7280,139.9070],
  motoyawata:[35.7220,139.9290], shimosanakayama:[35.7120,139.9450],
  nishifunabashi:[35.7070,139.9580], funabashi:[35.7010,139.9850],
  higashifunabashi:[35.6980,140.0000], tsudanuma:[35.6910,140.0200],
  makuharihongo:[35.6720,140.0530], makuhari:[35.6620,140.0650], shinkemigawa:[35.6560,140.0800],
  inage:[35.6370,140.0890], nishichiba:[35.6250,140.1010], chiba:[35.6130,140.1130],
  /* 京葉線 */
  hatchobori:[35.6750,139.7770], etchujima:[35.6690,139.7920], shiomi:[35.6650,139.8080],
  shinkiba:[35.6460,139.8270], kasairinkaikoen:[35.6440,139.8600], maihama:[35.6350,139.8810],
  shinurayasu:[35.6480,139.9160], ichikawashiohama:[35.6640,139.9300],
  futamatashimmachi:[35.6790,139.9490], minamifunabashi:[35.6820,139.9880],
  shinnarashino:[35.6690,140.0140], makuharitoyosuna:[35.6540,140.0330],
  kaihimmakuhari:[35.6480,140.0430], kemigawahama:[35.6450,140.0620],
  inagekaigan:[35.6430,140.0790], chibaminato:[35.6100,140.1000], soga:[35.5870,140.1250],
  /* 東海道線 */
  fujisawa:[35.3390,139.4870], tsujido:[35.3320,139.4470], chigasaki:[35.3300,139.4040],
  hiratsuka:[35.3270,139.3500], oiso:[35.3090,139.3130], ninomiya:[35.3020,139.2540],
  kozu:[35.2870,139.2060], kamonomiya:[35.2670,139.1780], odawara:[35.2560,139.1550],
  /* りんかい線 */
  shinagawaseaside:[35.6090,139.7480], tennozuisle:[35.6220,139.7500],
  tokyoteleport:[35.6270,139.7790], kokusaitenjijo:[35.6330,139.7920],
  shinonome:[35.6420,139.8030], tatsumi:[35.6450,139.8160],
  /* 相鉄線 */
  hazawa:[35.4890,139.5850], nishiya:[35.4790,139.5590], tsurugamine:[35.4790,139.5390],
  futamatagawa:[35.4740,139.5160], kibogaoka:[35.4720,139.4980], mitsukyo:[35.4740,139.4840],
  seya:[35.4720,139.4660], yamato:[35.4680,139.4610], sagamiotsuka:[35.4710,139.4380],
  sagamino:[35.4690,139.4230], kashiwadai:[35.4620,139.4080], ebina:[35.4510,139.3900],
  /* 小田急小田原線 */
  yoyogiuehara:[35.6690,139.6800], shimokitazawa:[35.6614,139.6680], kyodo:[35.6510,139.6360],
  seijogakuenmae:[35.6400,139.5990], noborito:[35.6200,139.5700],
  shinyurigaoka:[35.6030,139.5070], machida:[35.5420,139.4470], sagamiono:[35.5310,139.4370],
  honatsugi:[35.4410,139.3650], isehara:[35.4010,139.3130], hadano:[35.3760,139.2200],
  shinmatsuda:[35.3490,139.1400]
};
