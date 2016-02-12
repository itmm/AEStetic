'use strict';

// function encode(state, expandedKey) {
// function decode(block, state, expandedKey) {

function encode_chain(state, expandedKey) {
    return encode(0, state, expandedKey);
}

function decode_chain(input, state, expandedKey) {
    return decode(0, input, state, expandedKey);
}