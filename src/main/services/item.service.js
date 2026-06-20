/**
 * @FileName     : item.service.js
 * @Description  : 아이템 비즈니스 로직 — validation + repository 위임
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

const ItemRepository = require('../repositories/item.repository');
const { nanoid }     = require('nanoid');

/**
 * @description 전체 아이템 조회
 * @returns {Array}
 */
const getAll = () => ItemRepository.findAll();

/**
 * @description ID로 아이템 조회
 * @param {string} id
 * @returns {Object|null}
 */
const getById = (id) => ItemRepository.findById(id);

/**
 * @description 아이템 생성
 * @param {Object} data
 * @param {string} data.title
 * @returns {Object} 생성된 아이템
 */
function create(data) {
  if (!data || !data.title) throw new Error('제목은 필수입니다.');
  const item = {
    id       : nanoid(),
    title    : data.title.trim(),
    content  : data.content || '',
    tags     : data.tags    || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  ItemRepository.insert(item);
  return item;
}

/**
 * @description 아이템 수정
 * @param {string} id
 * @param {Object} data
 * @returns {Object} 수정된 아이템
 */
function update(id, data) {
  const item = ItemRepository.findById(id);
  if (!item) throw new Error(`아이템을 찾을 수 없습니다: ${id}`);
  const updated = { ...item, ...data, id, updatedAt: new Date().toISOString() };
  ItemRepository.update(updated);
  return updated;
}

/**
 * @description 아이템 삭제
 * @param {string} id
 * @returns {{ deleted: string }}
 */
function remove(id) {
  ItemRepository.remove(id);
  return { deleted: id };
}

module.exports = { getAll, getById, create, update, remove };
