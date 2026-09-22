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
   from: スタート駅 / goals: 順番に回る目的駅 / turns: 制限ターン
   ============================================================ */
const MISSIONS = [
  { id:'m1', title:'あかばねで のりかえて しんじゅくへ', kana:'あかばねで のりかえて しんじゅくへ',
    from:'kawaguchi', goals:['shinjuku'], turns: 6, level:1,
    hint:'さいきょうせんは かわぐちを とおらないよ。まず あかばねまで いこう' },
  { id:'m2', title:'てつどうはくぶつかんへ（大宮）', kana:'てつどうはくぶつかんへ',
    from:'kawaguchi', goals:['omiya'], turns: 6, level:1,
    hint:'けいひんとうほくせんで きたへ すすむか、あかばねで はやい でんしゃに のりかえると ぐんと ちかづく' },
  { id:'m3', title:'うえのどうぶつえんと あきはばら', kana:'うえのどうぶつえんと あきはばら',
    from:'akabane', goals:['ueno','akihabara'], turns: 7, level:1,
    hint:'うえのから あきはばらは とても ちかいよ' },
  { id:'m4', title:'ゆめの くに まいはまへ', kana:'ゆめの くに まいはまへ',
    from:'kawaguchi', goals:['tokyo','maihama'], turns: 9, level:2,
    hint:'とうきょうえきから けいようせんに のりかえ。ホームが とおいから じかんが かかる' },
  { id:'m5', title:'おだいばで あそぶ', kana:'おだいばで あそぶ',
    from:'akabane', goals:['osaki','tokyoteleport'], turns: 10, level:2,
    hint:'さいきょうせんは おおさきから そのまま りんかいせんに はいるよ' },
  { id:'m6', title:'よこはま みなとめぐり', kana:'よこはま みなとめぐり',
    from:'omiya', goals:['ikebukuro','yokohama'], turns: 11, level:2,
    hint:'しょうなんしんじゅくラインが はやい' },
  { id:'m7', title:'たかおさんに のぼる', kana:'たかおさんに のぼる',
    from:'kawaguchi', goals:['shinjuku','takao'], turns: 12, level:3,
    hint:'しんじゅくから ちゅうおうとっかいに のると ぐんと すすむ' },
  { id:'m8', title:'ロマンスカーで おだわらじょうへ', kana:'ロマンスカーで おだわらじょうへ',
    from:'akabane', goals:['shinjuku','odawara'], turns: 9, level:3,
    hint:'しんじゅくから おだきゅうの ロマンスカー。とまる えきが とても すくない' },
  { id:'m9', title:'そうてつせんで えびなまで', kana:'そうてつせんで えびなまで',
    from:'omiya', goals:['osaki','ebina'], turns: 14, level:3,
    hint:'さいきょうせんは そうてつせんにも そのまま はいっていく' },
  { id:'m10',title:'いちにちで とうきょうを ぐるり', kana:'いちにちで とうきょうを ぐるり',
    from:'kawaguchi', goals:['ikebukuro','shibuya','tokyo','omiya'], turns: 17, level:3,
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
