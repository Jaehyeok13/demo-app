/**
 * @FileName     : item.repository.js
 * @Description  : items.json 읽기/쓰기 전담 — 저장 방식만 담당 (로직 없음)
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.04.01.   develJan  최초생성
 *
 * @author  develJan
 * @since   2026.04.01
 * @version 1.0.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { app } = require('electron');

const FILE = path.join(app.getPath('userData'), 'items.json');

function _load() {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch { return []; }
}

function _save(items) {
  fs.writeFileSync(FILE, JSON.stringify(items, null, 2), 'utf8');
}

const findAll    = ()       => _load();
const findById   = (id)     => _load().find(i => i.id === id) || null;
const insert     = (item)   => { const all = _load(); all.push(item); _save(all); };
const update     = (item)   => { const all = _load().map(i => i.id === item.id ? item : i); _save(all); };
const remove     = (id)     => _save(_load().filter(i => i.id !== id));

module.exports = { findAll, findById, insert, update, remove };
