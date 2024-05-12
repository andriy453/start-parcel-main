<?php
error_reporting(E_ALL & ~E_NOTICE);

// Project name
define('CONF_PROJECT', '__TITLE__-e71e5f188c97675c6d425679d68091eb');
define('CONF_DIR', '__TITLE__/');
define('CONF_URL', 'https://onidone.com/');

// DIR
define('_DIR_', '/');
// Path to the application folder
define('_SYSDIR_', $_SERVER['DOCUMENT_ROOT'] . _DIR_);
// Path to the styles folder
define('_SITEDIR_', _DIR_);
// URI
define('_URI_', mb_substr($_SERVER['REQUEST_URI'], mb_strlen(_DIR_) - 1));


//if ($_SERVER['REDIRECT_SCRIPT_URI'])
//    $host = mb_substr($_SERVER['REDIRECT_SCRIPT_URI'], 0, mb_strrpos($_SERVER['REDIRECT_SCRIPT_URI'], '/')) . '/';
//else
$host = 'https://' . $_SERVER['HTTP_HOST'] . '/' . CONF_DIR;

// ----- Functions ----- //

function print_data($data, $var_dump = false)
{
    echo '<hr/><pre>';
    print_r($data);
    echo '<br>';
    if ($var_dump)
        var_dump($data);
    echo '</pre><hr/>';
}

function levelUp($path)
{
    $parts = explode('/', $path);

    if (count($parts) >= 1)
        unset($parts[count($parts) - 1]);

    return implode('/', $parts);
}


$page = 'index.html';
if ($_GET['page'])
    $page = $_GET['page'];

$path = __DIR__ . '/';
if ($_GET['dir'])
    $path = __DIR__ . '/' . $_GET['dir'] . '/';


$pageURL = $host . ($_GET['dir'] ? $_GET['dir'] . '/' : '') . $page;

$scanned = scandir($path);
$files = [];
$dirs  = [];

foreach ($scanned as $item) {
    if ($item == '.' || $item == '..')
        continue;

    if (preg_match('/^([a-z0-9.\-_]+\.html$)\s*/im', $item))
        $files[] = $item;

    //if (is_dir($path . $item))
    //    $dirs[] = $item;
}

$html = @file_get_contents($path . $page);
if (!$html)
    $html = '<div>No pages</div>';

echo $html; // Display html page
?>

<style>
    .scan_block {
        font-family: 'Inter', sans-serif;
        font-weight: 400;
        position: fixed;
        top: calc(50% - 207px);
        right: 0;
        height: calc(50px * 8);
        width: 60px;
        background-color:#22222C;;
        z-index: 9999999;
        overflow: hidden;
        transition: width 0.3s;
        /* Track */
    }
    @media ( hover : hover ) {
        .scan_block:hover {
            width: 203px;
            overflow-y: overlay;
        }
    }
    .scan_block::-webkit-scrollbar {
        width: 3px;
        border-radius: 3px;
    }
    .scan_block::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 5px;

    }
    .scan_block::-webkit-scrollbar-thumb {
        background-color: #4c4c50;
        border-radius: 5px;
    }

    .scan_block.left-side {
        left: 0;
        right: initial;
    }

    .scan_block:not(.active) .scan_item a.green_btn{
        width: 0;
        padding: 0;
        overflow: hidden;
    }
    .scan_block .scan_item {
        height: 50px;
        font-size: 12px;
        display: flex;
        align-content: center;
        width: 100%;
        border-bottom: 1px solid #3D3D4A;
    }

    .scan_block.left-side .scan_btn {
        transform: scale(-1);
    }

    .scan_btn{
        min-width: 50px;
        padding: 5px;
        display: flex;
        align-content: center;
        justify-content: center;
        position: relative;

    }
    .scan_btn:after{
        position: absolute;
        top: 10px;
        left: 10px;
        bottom: 10px;
        right: 10px;
        background-color: #2F4457;
        content: '';
        border-radius: 1px;
    }
    .scan_btn svg{
        margin: auto;
        position: relative;
        z-index: 2;
    }
    .scan_block .scan_item a {
        font-family: 'Inter', sans-serif;
        display: flex;
        width: 100%;
        align-items: center;
        position: relative;
        padding: 16px;

        text-decoration: none;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 15px;
        line-height: 18px;
        font-weight: 400;
        color: #fff;
        transition: all 0.3s;
    }
    .scan_block .scan_item.sc_dir a {
        padding-left: 16px;
    }
    .scan_block .scan_item.sc_dir a:before {
        position: absolute;
        top: calc(50% - 4px);
        left: 0;
        content: " ";
        width: 8px;
        height: 8px;
        background-color: #0d95e8;
    }
    .scan_block .scan_item a.green_btn {
        background-color: #D90C0C;

    }
    .scan_block .scan_item a:hover {
        background-color:#2F4457;
        color: #fff;
    }
    .scan_block .scan_item.active a {
        background-color: #D90C0C;
        color: #fff;
    }
    .sc_pointer {
        cursor: pointer;
    }

    .scan_block.touch-screen {
        height: 50px;
        width: 50px;
        top: initial;
        bottom: 20px;
        border-radius: 5px 0 0 5px;
    }

    .scan_block.touch-screen.left-side {
        left: initial;
        top: initial;
        right: 0;
        width: 203px;
        height: 400px;
        overflow-y: overlay;
    }

    .scan_block.touch-screen .green_btn {
        display: none;
    }

    .scan_block.touch-screen .scan_item:not(:first-child) {
        display: none;
    }

    .scan_block.touch-screen.left-side .green_btn {
        display: flex;
    }

    .scan_block.touch-screen.left-side .scan_item:not(:first-child) {
        display: flex;
    }
</style>

<script src="
https://cdn.jsdelivr.net/npm/body-scroll-lock@4.0.0-beta.0/lib/bodyScrollLock.min.js
"></script>

<div id="scanBlock" class="scan_block active">
    <div class="scan_item">
        <a class="green_btn sc_pointer" onclick="load('api/create_task', 'project=<?= CONF_PROJECT ?>', 'url=<?= $pageURL ?>');">Report an issue</a>
        <button class="scan_btn"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 3.33334H17.5V5.00001H2.5V3.33334ZM2.5 15.8333H17.5V17.5H2.5V15.8333ZM9.16667 11.6667H17.5V13.3333H9.16667V11.6667ZM9.16667 7.50001H17.5V9.16668H9.16667V7.50001ZM5.83333 10.4167L2.5 13.3333V7.50001L5.83333 10.4167Z" fill="white"/>
            </svg>
        </button>
    </div>
    <!-- print pages -->
    <?php if ($_GET['dir']) { ?>
        <div class="scan_item sc_dir">
            <a href="scan.php?dir=<?= levelUp($_GET['dir']) ?>">..</a>
        </div>
    <?php } ?>
    <?php if (is_array($dirs) && count($dirs) > 0) foreach ($dirs as $d) { ?>
        <div class="scan_item sc_dir">
            <a href="scan.php?dir=<?= ($_GET['dir']) ? ($_GET['dir'] . '/' . $d) : $d ?>"><?= $d ?></a>
        </div>
    <?php } ?>
    <?php if (is_array($files) && count($files) > 0) foreach ($files as $f) { ?>
        <div class="scan_item <?= ($page == $f ? 'active' : '') ?>">
            <a href="scan.php?<?= ($_GET['dir'] ? 'dir=' . $_GET['dir'] . '&' : '') ?>page=<?= $f ?>"><?= $f ?></a>
        </div>
    <?php } ?>
    <!-- /print pages -->
</div>

<div id="api_content"></div>

<!--    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js" type="text/javascript"></script>-->

<script>
    "use strict";

    let files,
        site_url = '<?= CONF_URL ?>';


    function clearFiles() {
        files = null;
    }

    function load(url = null, ...fileds) {
        let data = new FormData();
        let type = 'POST';
        let sysFunctions = {};

        // Files
        let fieldOfFiles = $("#files");
        if (typeof fieldOfFiles[0] != "undefined")
            files = fieldOfFiles[0].files;

        $.each(files, function(key, value) {
            data.append(key, value);
        });


        // Parse params:
        // #text - значення input з id='text'
        // .text - значення input з class='text'
        // age=25 - передаємо ключ та значення
        // name#field - передаємо ключ та значення форми ( ключ=name, значення=field )
        // !name#el - передаємо ключ та значення елементу(не input, ex: <p id="el">Text</p>)
        // form:#login - передаємо форму з id='login'
        // json:{} - передаємо json // TODO ...
        for (let i = 0; i < fileds.length; i++) {

            if (fileds[i].charAt(0) === '#' || fileds[i].charAt(0) === '.') {
                data.append(fileds[i], $(fileds[i]).val());
            } else {

                // if (fileds[i].indexOf('=') >= 0) {
                if (/^\w{1,32}=(.*?)$/i.test(fileds[i])) {
                    let arr = fileds[i].split('=');
                    data.append(arr[0], arr[1]);
                } else {
                    if (/^!?\w{1,32}#(.*?)$/i.test(fileds[i])) { // name#field
                        let arr = fileds[i].split('#');
                        if (arr[0].charAt(0) === '!')
                            data.append(arr[0].replace('!', ''), $('#' + arr[1]).text());
                        else
                            data.append(arr[0], $('#' + arr[1]).val());

                    } else if (/^!?\w{1,32}\.(.*?)$/i.test(fileds[i])) { // name.field
                        let arr = fileds[i].split('.');
                        if (arr[0].charAt(0) === '!')
                            data.append(arr[0].replace('!', ''), $('.' + arr[1]).text());
                        else
                            data.append(arr[0], $('.' + arr[1]).val());

                    } else if (/^\*(.*?)\*$/i.test(fileds[i])) { // *SYS_OPTION*
                        let arr = fileds[i].split('=');
                        sysFunctions[arr[0]] = (arr[1]) ? arr[1] : true;

                    } else if ('url:url' === (fileds[i])) { // url:url curent page url
                        data.append('_url', window.location.href);

                    } else {
                        // form serialize
                        if (/^form:#(.*?)$/i.test(fileds[i])) {
                            let arr = fileds[i].split('#');
                            let elements = document.forms[arr[1]].elements;
                            // console.log($('#' + arr[1]).serialize());

                            for (let i = 0; i < elements.length; i++) {
                                let formField = $(elements[i]);

                                if (formField[0].type === 'radio' || formField[0].type === 'checkbox') {
                                    if (formField[0].checked === true) {
                                        data.append(formField.attr("name"), formField[0].value);
                                    }
                                } else {
                                    data.append(formField.attr("name"), formField.val());
                                }
                            }
                        }
                        // console.log(fileds[i]);
                    }
                }
            }
        }


        let contentType = false;
        if (/Edge/.test(navigator.userAgent)) {
            // contentType = "application/x-www-form-urlencoded"; // [-----------------------------7e314734a0746 Content-Disposition:_form-data;_name] => "email" shloserb@gmail.com
            // contentType = "multipart/form-data;"; // Missing boundary in multipart/form-data POST data in <b>Unknown</b> on line <b>0</b>
            // contentType = "application/json; charset=utf-8;"; // empty
            // contentType = "multipart/form-data; charset=utf-8; boundary=" + Math.random() .toString().substr(2); // empty
        }

        $.ajax({
            url: url.substring(0, 4) === 'http' ? url : (site_url + trim(url, '/')),
            type: type,
            data: data,
            cache: false,
            dataType: 'json',
            processData: false,
            contentType: contentType,
            // headers: {'X-Requested-With': 'XMLHttpRequest'},

            success: function(result) {

                if (result.error == false) {
                    // Parse result
                    for (let key in result.res)
                        processField(result.res[key]);

                    // callAfterLoad(); // After Load func
                } else {
                    if (Array.isArray(result.error)) {
                        result.error.forEach(function(item, i, arr) {
                            $('.' + item.key).addClass('error');
                            $('.' + item.key + ' span.error_text').text(item.value);
                        });
                    } else {
                        alert(result.error);
                    }

                    // callAfterLoad(); // After Load func
                }

                // callAfterLoad();
            },
            error: function(result) {
                // alert("Error!");
            }
        });

        // callAfterClick();
    }

    function processField(jsonObj) {
        try {
            if (jsonObj.action === 'delete') {
                // delete
                $(jsonObj.key).remove();

            } else if (jsonObj.action === 'prepend') {
                // paste at the begin
                $(jsonObj.key).prepend(jsonObj.value);

            } else if (jsonObj.action === 'append') {
                // paste et the end
                $(jsonObj.key).append(jsonObj.value);

            } else if (jsonObj.action === 'after') {
                // paste after
                $(jsonObj.key).after(jsonObj.value);

                console.log(jsonObj.key);
                console.log(jsonObj.value);

            } else if (jsonObj.action === 'before') {
                // paste before
                $(jsonObj.key).before(jsonObj.value);

            } else if (jsonObj.action === 'attr') {
                // set attr
                $(jsonObj.key).attr(jsonObj.attrName, jsonObj.value);

            } else if (jsonObj.action === 'removeAttr') {
                // set attr
                $(jsonObj.key).removeAttr(jsonObj.value);

            } else if (jsonObj.action === 'addClass') {
                // set attr
                $(jsonObj.key).addClass(jsonObj.value);

            } else if (jsonObj.action === 'removeClass') {
                // set attr
                $(jsonObj.key).removeClass(jsonObj.value);

            } else if (jsonObj.action === 'remove') {
                // remove element
                $(jsonObj.key).remove();

            } else if (jsonObj.action === 'val') {
                // set value
                $(jsonObj.key).val(jsonObj.value);

            } else if (jsonObj.action === 'func') {
                // function
                window[jsonObj.key](jsonObj.value);

            } else if (jsonObj.action === 'load') {
                // load page
                if (jsonObj.value)
                    load(jsonObj.key, jsonObj.value);
                else
                    load(jsonObj.key);

            } else if (jsonObj.action === 'redirect') {
                // redirect
                window.location.href = jsonObj.value;

            } else if (jsonObj.action === 'url') { //url
                // add history
                history.pushState('', '', jsonObj.value);

            } else if (jsonObj.url != false && typeof jsonObj.url !== 'undefined') {
                // add history
                history.pushState('', '', jsonObj.url);

            } else if (jsonObj.click != false && typeof jsonObj.click !== 'undefined') {
                // trigger click
                $(jsonObj.click).trigger("click");

            } else {
                $(jsonObj.key).html(jsonObj.value);
            }
            return;
        } catch (e) {
            console.log("Error process", e);
            return;
        }
    }

    /**
     * Function check for touchscreen device
     * **/
    function is_touch_enabled() {
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      );
    }

    function closePopup(el) {
        if (el)
            $(el).html('');
        else
            $('#api_content').html('');
    }

    function trim(str, charlist) {
        charlist = !charlist ? ' \s\xA0' : charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\$1');
        let re = new RegExp('^[' + charlist + ']+|[' + charlist + ']+$', 'g');
        return str.replace(re, '');
    }

    const scanBlock  = document.querySelector('.scan_block');

    document.addEventListener('DOMContentLoaded',()=>{
        if(scanBlock){
            const scanBtn = scanBlock.querySelector('.scan_btn')
            scanBtn.addEventListener('click',()=>{
                scanBlock.classList.toggle('left-side')
            })
        }
    })

    let previousButtonPress = null;

    if (is_touch_enabled()) {
        scanBlock.classList.add('touch-screen');
    }

    document.addEventListener('keyup', function (e) {
        if (previousButtonPress === 17 && e.keyCode === 17) {
            scanBlock.classList.toggle('hidden');
            previousButtonPress = null;
        } else {
            previousButtonPress = e.keyCode;
        }

        setTimeout(function () {
            previousButtonPress = null;
        }, 300);
    })

    // bodyScrollLock logic
    const disableBodyScroll = bodyScrollLock.disableBodyScroll;
    const enableBodyScroll = bodyScrollLock.enableBodyScroll;
    const scanBlockElement = document.querySelector('#scanBlock');

    scanBlockElement.addEventListener('mouseenter', function () {
        disableBodyScroll(scanBlockElement, {
            reserveScrollBarGap: true,
        });
    });

    scanBlockElement.addEventListener('mouseleave', function () {
        enableBodyScroll(scanBlockElement);
    });
</script>
<?php
/* End of file */