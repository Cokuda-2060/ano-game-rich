    $(document).ready(function() {
        // ==========================================
        // 全体ルールの説明・定義
        // ==========================================

        // 状態管理
        var turn = "wait"; //初期のフェーズを管理（"wait","my_up", "my_call", "pc"の4種類）
        var selectedMyUp = 0; // 自分が選んだ指の数を一時保存する変数
        var myHands = 2; // 自分の残り手の本数（最初は2本）
        var pcHands = 2; // 相手の残り手の本数（最初は2本）

        // ★上げた指の本数に応じた画像パスを返す関数
        function getHandImg(num) {
            return "img/thmb" + num + ".png"; // img/thmb0.png, img/thmb1.png, img/thmb2.png
        }

        // 画面の選択肢を更新する関数
        function updateUI() {
            //【残機表示】残り手が1本以下(0または1)のときは右半分をトリミングして消す（トグルクラス関数でhalf_handクラスを付与→cssで指定）
            $("#pc_hand_img").toggleClass("half_hand", pcHands <= 1);
            $("#my_hand_img").toggleClass("half_hand", myHands <= 1);
            // .toggleClass() は「指定したCSSのclassをつけたり外したり切り替えてくれるjQueryの関数」

            // 残り手0本で透明（フェードアウト）にする
            /*$("#pc_hand_img").toggleClass("half_hand_fade", pcHands === 0);
            $("#my_hand_img").toggleClass("half_hand_fade", myHands === 0);*/

            //【ゲーム終了時の制御】どちらかの手が0本になった場合
            if (myHands === 0 || pcHands === 0) {
                $(".call").hide(); // コールボタンを全て非表示
                $(".up").hide();   // 指ボタンを全て非表示
                $("#start").show();   // はじめるボタンを表示
                return; // リターンをここで強制終了！（下の行には進まない）　returnはステートメントの一種。予約語ともいう。varとかと同じ。
            }

            //【表示ボタンの制御】
            if( turn === "my_up"){
                $(".up").show()
                $(".call").hide()
            }
            if( turn === "my_call"){
                $(".up").hide()
                $(".call").show()
            }
            if( turn === "pc"){
                $(".up").show()
                $(".call").hide()
            }
            if( turn === "wait"){
                $(".up").hide();
                $(".call").hide();
                $("#pc_hand_img, #my_hand_img").addClass("wait_gray"); // 指はグレーアウトにしておく
                return;
            }


            // 【ゲーム継続中】
            $("#start").hide(); //はじめるボタンを隠す
            $("#judgefield").show();　//補助コメント欄を表示する
            $("#pc_hand_img, #my_hand_img").removeClass("wait_gray"); // 指のグレーアウトを解除！
            
            var maxCall = myHands + pcHands;

            // コールボタンの制限（0 〜 maxCall まで表示）
            $(".call li").each(function() {
                var val = Number($(this).text());
                if (val > maxCall) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });

            // 自分の指ボタンの制限（0 〜 myHands まで表示）
            $(".up li").each(function() {
                var val = Number($(this).text());
                if (val > myHands) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
                
            });


        }

        // 最初にUI更新を呼んでおく（状態を把握して最新にする）
        updateUI();


        // ==========================================
        // 【自分のターンその１】アップを選択
        // ==========================================
        $(".up li").on("click", function(){
            if (myHands === 0 || pcHands === 0) return; // ゲームが終了している場合は処理しない

            //　パターン①自分のターンでアップを選択
            if (turn === "my_up"){
                selectedMyUp = Number($(this).text()); // ①選んだ指の数を保存
                $("#judgment").html("指は"+ selectedMyUp + " 本挙げるよ！<br>次にコールを選んでね！");　//アップを表示
                turn = "my_call"; // ②フェーズを my_call に変更
                updateUI();       // ③UI更新（これで .call ボタンが表示されます！）
                return;           // my_up の処理はここで終了
            }

            //　パターン②相手のターンでアップを選択
            if (turn === "pc"){
                selectedMyUp = Number($(this).text()); // ①選んだ指の数を保存
                turn = "pc";

                //【１】乱数：自分のあげる指の数をクリックをトリガーにして、相手のあげる指数とコール数をランダム決める。
                var maxCall = myHands + pcHands;
                var pccall = Math.floor( Math.random()*(maxCall + 1) );
                var pcup = Math.floor( Math.random()*(pcHands + 1) );

                //【２】相手の上げた指と自分の指の数と上がった指の合計と相手のコール数を表示

                var kakegoeText = $("#kakegoeran").val(); // 掛け声入力欄の値を取得

                var mythumup = Number($(this).text()); //自分のあげた指の数を取得
                $("#myup").html( mythumup ); //その数を数字に変換してから表示

                var total = ( pcup + mythumup )
                // $("#sumup").html( total ); //上がった合計の数を表示←もう不要？？ 

                // 決まった指の数に合わせて画像を更新！
                $("#pc_hand_img").attr("src", getHandImg(pcup));
                $("#my_hand_img").attr("src", getHandImg(mythumup));
                
                $("#call_disp").html( kakegoeText + "／　" + pccall + "　＼");　//相手のコールを上書きして表示

                //【３】勝ち負け判定
                if (total == pccall) {
                    pcHands--; // 相手の指が1本減る！

                    if (pcHands === 0) {
                        $("#judgment").html("相手のコールが的中！<br>あなたの敗北…");
                        $("#pc_hand_img").fadeOut(1000, function() {
                            $("#pc_win_img").fadeIn(1000);  // 相手の指をフェードアウトさせ、消えきったらWIN画像をフェードイ
                            });
                    } else {
                        $("#judgment").html("相手のコールが的中！1本引っ込められたよ！<br>次はあなたのターン<br>まずはUPする指を選んでね");
                        turn = "my_up";
                    }
                } else {
                    $("#judgment").html("ラッキ〜相手が外した！<br>あなたのターンに交代！<br>UPする指を選んでね！");
                    turn = "my_up";
                }

                // ★ターン交代や残り指の変更を画面に反映させる
                updateUI();
            }
        });



        // ==========================================
        // 【自分のターンその２】コールを選択して勝負
        // ==========================================
            $(".call li").on("click",function(){
                if (myHands === 0 || pcHands === 0) return;
                if (turn !== "my_call") return; // my_call 以外の時は何も処理しない
            

            //自分のコールを取得して表示
            var kakegoeText = $("#kakegoeran").val(); // 掛け声入力欄の値を取得
            var mycall = Number($(this).text());

            $("#call_disp").html(kakegoeText + "＼　" + mycall + "　／"); //自分のコールを上書き表示
        
            //【３】乱数：あげる指数を決める。
            var pcup = Math.floor(Math.random() * (pcHands + 1));
            var mythumup =  selectedMyUp // ※保存しておいた自分のアップの数字を使用


            //【４】画像の表示
            // 決まった指の数に合わせて画像を更新！
            $("#pc_hand_img").attr("src", getHandImg(pcup));
            $("#my_hand_img").attr("src", getHandImg(mythumup));

            var total = ( pcup + mythumup )
  

            //【５】勝ち負け判定
        if (total == mycall) {
            myHands--; // 自分の手が1本減る！
            if (myHands === 0) {
                $("#judgment").html("的中！<br>あなたの勝利！");
                $("#my_hand_img").fadeOut(1000, function() {
                    $("#my_win_img").fadeIn(1000);
                });    
                // ゲーム終了処理など
            } else {
                $("#judgment").html("的中！1本引っ込めたよ！<br> 次は相手のコール<br>UPする指を選んでね");
                turn = "pc";
            }
        } else {
            $("#judgment").html("残念ハズレ！相手のターンに交代！<br>UPする指数を選んで！");
            turn = "pc";
        }

            // ★ターン交代や残り指の変更を画面に反映させる
            updateUI();

        });


        // ==========================================
        // 【リセット処理】はじめからボタンを押した時
        // ==========================================
        $("#reset").on("click", function(){
            // 変数をすべて最初の状態に戻す
            turn = "my_up";
            myHands = 2;
            pcHands = 2;

            // 画面のテキスト表示をリセット
            $("#pcup").html("");
            $("#pccall").html("");
            $("#myup").html("");
            $("#mycall").html("");
            $("#sumup").html("");
            $("#judgment").html("相手のコールからはじめるよ！<br>自分のUPする指を選んでね！");
            $("#call_disp").html("");

            // 画像を初期表示（0本）に戻す
            $("#pc_hand_img").attr("src", getHandImg(0));
            $("#my_hand_img").attr("src", getHandImg(0));

            // 決着後隠していた指画像を両方とも再表示する
            $("#pc_hand_img").show();
            $("#my_hand_img").show();

            //WIN画像を隠しておく
            $("#my_win_img").hide();
            $("#pc_win_img").hide();

            // ★スタートエリア（掛け声入力＋ボタン）だけを隠す
            $("#start").hide();

            // UIを再更新してボタンを再表示
            updateUI();
        });
    });
