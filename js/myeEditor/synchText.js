angular.module('MYE').service('SynchText', [function () {

        function addTokens(arr, tokens, ind) {
            for (var i = 0; tokens && i < tokens.length; i++) {
                try {
                    var tkn = tokens[ i ].trim().toLowerCase();
                    if (arr.hasOwnProperty(tkn)) {
                        arr[ tkn ].push(ind);
                    } else {
                        arr[ tkn ] = [ind];
                    }
                } catch (e) {
                    console.log("");
                }
            }
        }
        function synch(vttPL, vttEN) {
            var dicWordEN = [];
            var dicNumberEN = [];
            var dicWordPL = [];
            var dicNumberPL = [];
            tokenize(vttPL, vttEN, dicWordEN, dicNumberEN, dicWordPL, dicNumberPL);
            var dicEN = Object.assign({}, dicNumberEN, dicWordEN);
            var dicPL = Object.assign({}, dicNumberPL, dicWordPL);
            correction(vttPL, vttEN, dicEN, dicPL);
        }
        function tokenize(vttPL, vttEN, dicWordEN, dicNumberEN, dicWordPL, dicNumberPL) {
            var regN = /(?:\d*\.)?\d+/g;
            var regW = /[a-zA-Z]{4,}/g;
            for (var i = 0; i < vttEN.length; i++) {
                var txt = vttEN[i].text;
                var arrNumbers = txt.match(regN);
                var arrWords = txt.match(regW);
                addTokens(dicWordEN, arrWords, i);
                addTokens(dicNumberEN, arrNumbers, i);
            }
            for (var i = 0; i < vttPL.length; i++) {
                var txt = vttPL[i].text;
                var arrNumbers = txt.match(regN);
                var arrWords = txt.match(regW);
                addTokens(dicWordPL, arrWords, i);
                addTokens(dicNumberPL, arrNumbers, i);
            }
        }
        function printTokens(arr) {
            for (var key in arr) {
                if (arr.hasOwnProperty(key)) {
                    console.log(key, arr[ key ].length);
                }
            }
        }
        function correction(vttPL, vttEN, dicEN, dicPL) {
            var corrItems = chooseTokenForCorrection(vttPL, vttEN, dicEN, dicPL);
            for( var i = 1; i < corrItems.length; i++){
                var c0  = corrItems[ i - 1];
                var c1  = corrItems[ i ];
                correctionByToken( c0, c1, vttPL, vttEN);               
            }
            for( var i = 0; i < vttPL.length; i++){
                vttPL[i].timeStart = vttPL[i].timeStartCor;
                vttPL[i].timeEnd = vttPL[i].timeEndCor;
            }
        }
        function correctionByToken( c0, c1, vttPL, vttEN) {


            var itemEN1 = vttEN[ c0.en ];
            var itemPL1 = vttPL[ c0.pl ];
            var itemEN2 = vttEN[ c1.en ];
            var itemPL2 = vttPL[ c1.pl ];

            var distPL = itemPL2.timeStart - itemPL1.timeStart;
            var distEN = itemEN2.timeStart - itemEN1.timeStart;

            var factor = distEN / distPL;
            var t0 = itemPL1.timeStart;
            var t0en = itemEN1.timeStart;

            for (var i = c0.pl; i <= c1.pl; i++) {
                var item = vttPL[i];
                var d = item.timeStart - t0;
                item.timeStartCor = t0en + d * factor;
                d = item.timeEnd - t0;
                item.timeEndCor = t0en + d * factor;
            }

        }
        function chooseTokenForCorrection(vttPL, vttEN, dicEN, dicPL) {
            var corrItems = [];
            for (var key in dicEN) {
                if (dicEN.hasOwnProperty(key) && dicPL.hasOwnProperty(key)) {
                    var dEN = dicEN[ key ];
                    var dPL = dicPL[ key ];
                    if (dEN.length === dPL.length) {
                        for (var k in dEN) {
                            vttEN[dEN[k]].synch = true;
                            vttEN[dEN[k]].synchText = vttPL[dPL[k]].text;
                            vttPL[dPL[k]].synch = true;
                            corrItems.push({en: dEN[k], pl: dPL[k]});
                        }
                        console.log(key, dicEN[ key ].length, dicPL[ key ].length);
                    }
                }
            }
            sortCorrItems( corrItems );
            corrItems = removeDuplicate( corrItems );
            return corrItems;
        }
        function removeDuplicate( corrItems ){
            var withoutDuplicate  = [];
            var last;
            for( var i = 0; i < corrItems.length; i++ ) {
                if( !last || corrItems[ i ].en !== last.en &&  corrItems[ i ].pl !== last.pl){
                    withoutDuplicate.push( corrItems[ i ] );
                }
                last = corrItems[ i ];
            }
            return withoutDuplicate;
        }
        function sortCorrItems( corrItems ) {
            function compare(a, b) {
                if (a.en < b.en)
                    return -1;
                if (a.en > b.en)
                    return 1;
                return 0;
            }

            corrItems.sort(compare);
        }

        function score(pl, en) {
            if (pl.timeEnd > en.timeStart && pl.timeStart < en.timeEnd) {
                var spnaPL = pl.timeEnd - pl.timeStart;
                var spnaEN = en.timeEnd - en.timeStart;
                return Math.min(pl.timeEnd, en.timeEnd) - Math.max(en.timeStart, pl.timeStart);
            } else if (pl.timeStart > en.timeEnd) {
                return en.timeEnd - pl.timeStart
            } else {
                return pl.timeEnd - en.timeStart;
            }
            return 0;
        }

        function margeVtt(vttPL, vttEN) {
            var lastJ = 0;
            for (var i = 0; i < vttPL.length; i++) {
                var pl = vttPL[ i ];
                var sOld = false;
                var enFit;
                for (var j = lastJ; j < vttEN.length; j++) {
                    var en = vttEN[ j ];
                    var s = score(pl, en);
                    if (sOld) {
                        if (s >= sOld) {
                            enFit = en;
                            sOld = s;
                        } else {
                            enFit.items.push(pl);
                            enFit.textTR ?  enFit.textTR += pl.text : enFit.textTR = pl.text;
                            break;
                        }
                    } else {
                        sOld = s;
                        enFit = en;
                    }
                }
            }
        }
        return {
            marge: function (vttPL, vttEN) {
               // synch(vttPL, vttEN);
                margeVtt(vttPL, vttEN);

            }
        }

    }]);

