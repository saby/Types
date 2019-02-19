/// <amd-module name="Types/_entity/adapter/Cow" />
/**
 * Адаптер для работы с даными в режиме Copy-on-write.
 * \|/         (__)
 *     `\------(oo)
 *       ||    (__)
 *       ||w--||     \|/
 *   \|/
 * @class Types/_entity/adapter/Cow
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/adapter/IAdapter
 * @implements Types/_entity/adapter/IDecorator
 * @mixes Types/_entity/SerializableMixin
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import IAdapter from './IAdapter';
import IDecorator from './IDecorator';
import CowTable from './CowTable';
import CowRecord from './CowRecord';
import SerializableMixin from '../SerializableMixin';
import {register} from '../../di';
import {mixin} from '../../util';

export default class Cow extends mixin(Abstract, SerializableMixin) implements IDecorator /** @lends Types/_entity/adapter/Cow.prototype */{
   /**
    * @property {Types/_entity/adapter/IAdapter} Оригинальный адаптер
    */
   _original: IAdapter;

   /**
    * @property {Function} Ф-я обратного вызова при событии записи
    */
   _writeCallback: Function;

   // endregion IAdapter

   // region IDecorator

   readonly '[Types/_entity/adapter/IDecorator]': boolean;

   /**
    * Конструктор
    * @param {Types/_entity/adapter/IAdapter} original Оригинальный адаптер
    * @param {Function} [writeCallback] Ф-я обратного вызова при событии записи
    */
   constructor(original: IAdapter, writeCallback?: Function) {
      super();
      SerializableMixin.constructor.call(this);
      this._original = original;
      if (writeCallback) {
         this._writeCallback = writeCallback;
      }
   }

   // region IAdapter

   forTable(data) {
      return new CowTable(data, this._original, this._writeCallback);
   }

   forRecord(data) {
      return new CowRecord(data, this._original, this._writeCallback);
   }

   getKeyField(data) {
      return this._original.getKeyField(data);
   }

   getProperty(data, property) {
      return this._original.getProperty(data, property);
   }

   setProperty(data, property, value) {
      return this._original.setProperty(data, property, value);
   }

   serialize(data) {
      return this._original.serialize(data);
   }

   getOriginal() {
      return this._original;
   }

   // endregion IDecorator

   // region SerializableMixin

   _getSerializableState(state) {
      state = SerializableMixin.prototype._getSerializableState.call(this, state);
      state._original = this._original;
      return state;
   }

   _setSerializableState(state) {
      const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
      return function() {
         fromSerializableMixin.call(this);
         this._original = state._original;
      };
   }

   // endregion SerializableMixin
}

Object.assign(Cow.prototype, {
   '[Types/_entity/adapter/Cow]': true,
   '[Types/_entity/adapter/IDecorator]': true,
   _moduleName: 'Types/entity:adapter.Cow',
   _original: null,
   _writeCallback: null
});

register('Types/entity:adapter.Cow', Cow, {instantiate: false});
