import IData from './IData';
import OptionsMixin, {IOptions as IOptionsOptions} from './OptionsMixin';
import LazyMixin from './LazyMixin';
import DataMixin, {IOptions as IDataOptions} from './DataMixin';
import {DestroyableMixin, OptionsToPropertyMixin, SerializableMixin, adapter} from '../entity';
import {logger, mixin} from '../util';

export interface IOptions extends IDataOptions, IOptionsOptions {
}

/**
 * Базовый источник данных.
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class Types/_source/Base
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_source/IData
 * @mixes Types/_entity/OptionsToPropertyMixin
 * @mixes Types/_entity/SerializableMixin
 * @mixes Types/_source/OptionsMixin
 * @mixes Types/_source/LazyMixin
 * @mixes Types/_source/DataMixin
 * @ignoreOptions options.writable
 * @public
 * @author Мальцев А.А.
 */
export default abstract class Base extends mixin<
   OptionsToPropertyMixin,
   SerializableMixin,
   OptionsMixin,
   LazyMixin,
   DataMixin
>(
   DestroyableMixin,
   OptionsToPropertyMixin,
   SerializableMixin,
   OptionsMixin,
   LazyMixin,
   DataMixin
) implements IData {
   protected constructor(options?: IOptions) {
      options = {...(options || {})};

      super(options);
      OptionsMixin.call(this, options);
      OptionsToPropertyMixin.call(this, options);
      SerializableMixin.call(this);
      DataMixin.call(this, options);
   }

   /**
    * @deprecated
    */
   static extend(mixinsList: any, classExtender: any): Function {
      logger.info('Types/_source/Base', 'Method extend is deprecated, use ES6 extends or Core/core-extend');

      if (!require.defined('Core/core-extend')) {
         throw new ReferenceError(
            'You should require module "Core/core-extend" to use old-fashioned "Types/_source/Base::extend()" method.'
         );
      }
      const coreExtend = require('Core/core-extend');
      return coreExtend(this, mixinsList, classExtender);
   }
}

Object.assign(Base.prototype, {
   '[Types/_source/Base]': true,
   _moduleName: 'Types/source:Base'
});
