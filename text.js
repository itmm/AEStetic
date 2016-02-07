'use strict';

var txt = {};

window.addEventListener('load', function () {
    txt['show'] = function(message, data, callback) {
        setTxt($('textbox-header'), message);
        var current = '';
        _.each(data, function(byte, idx) {
            if (idx == 0) {}
            else if (idx % 4 == 0) { current += '   '; }
            else { current += ' '; }
            current += formatByte(byte);
        });
        setTxt($('textarea'), current);
        dom.removeClass($('dimmer'), 'hidden');
        txt['callback'] = callback;
    };

    function isValidHexDigit(digit) {
        return ('0' <= digit) && ('9' >= digit) || ('a' <= digit) && ('f' >= digit) || ('A' <= digit) && ('F' >= digit);
    }

    txt['commit'] = function() {
        var entered = $('textarea').value;

        var result = [];
        var lastNibble = 0;
        var hasLastNibble = false;
        for (var i = 0; i < entered.length; ++i) {
            if (i < entered.length && entered[i] <= ' ') {
                if (hasLastNibble) {
                    result.push(lastNibble);
                    lastNibble = 0;
                    hasLastNibble = false;
                }
            } else if (isValidHexDigit(entered[i])) {
                var value = lastNibble * 16 + parseInt(entered[i], 16);
                if (hasLastNibble) {
                    result.push(value);
                    lastNibble = 0;
                    hasLastNibble = false;
                } else {
                    lastNibble = value;
                    hasLastNibble = true;
                }
            } else {
                alert("'" + entered[i] + "' is not a valid hex digit");
                return;
            }
        }
        if (hasLastNibble) {
            result.push(lastNibble);
        }

        if (txt.callback(result)) {
            txt.hide();
        }
    };
    txt['hide'] = function() {
        dom.addClass($('dimmer'), 'hidden');
    };
    $('dimmer').addEventListener('click', function(evt) {
        txt.hide();
        evt.preventDefault();
    });
    $('textbox').addEventListener('click', function(evt) {
        evt.stopPropagation();
    });
    $('textbox-ok').addEventListener('click', function(evt) {
        txt.commit();
        evt.preventDefault();
    });
    $('textbox-cancel').addEventListener('click', function(evt) {
        txt.hide();
        evt.preventDefault();
    });

    $('textarea').addEventListener('keydown', function(evt) {
        if (evt.keyCode == 13) {
            txt.commit();
            evt.preventDefault();
        }
    });
});