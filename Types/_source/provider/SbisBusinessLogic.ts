/// <amd-module name="Types/_source/provider/SbisBusinessLogic" />
/**
 * JSON-RPC Провайдер для бизнес-логики СБиС
 * @class Types/_source/provider/SbisBusinessLogic
 * @implements Types/_source/provider/IAbstract
 * @mixes Types/_entity/OptionsMixin
 * @public
 * @author Мальцев А.А.
 */

import IAbstract from './IAbstract';
import {OptionsToPropertyMixin} from '../../entity';
import {register} from '../../di';
import {mixin} from '../../util';
import RpcJson = require('Transport/RPCJSON');
import Deferred = require('Core/Deferred');

export default class SbisBusinessLogic extends mixin(Object, OptionsToPropertyMixin) implements IAbstract /** @lends Types/_entity/SbisBusinessLogic.prototype */{
   readonly '[Types/_source/provider/IAbstract]': boolean = true;

   /**
    * @cfg {Endpoint} Конечная точка, обеспечивающая доступ клиента к БЛ
    * @name Types/_source/provider/SbisBusinessLogic#endpoint
    * @see getEndPoint
    * @example
    * <pre>
    *    var dataSource = new SbisBusinessLogic({
    *       endpoint: {
    *          address: '/service/url/',
    *          contract: 'Сотрудник'
    *       }
    *    });
    * </pre>
    */
   _$endpoint: any = {};

   /**
    * @cfg {Function} Конструктор сетевого транспорта
    */
   _$transport: any;

   /**
    * Разделитель пространств имен
    */
   _nameSpaceSeparator: string;

   constructor(options?) {
      super();
      OptionsToPropertyMixin.call(this, options);
   }

   /**
    * Возвращает конечную точку, обеспечивающую доступ клиента к функциональным возможностям БЛ
    * @return {Endpoint}
    * @see endpoint
    */
   getEndpoint() {
      return this._$endpoint;
   }

   call<T>(name: string, args: Array<string> | Object): Deferred<T> {
      name = name + '';
      args = args || {};

      const Transport = this._$transport;
      let endpoint = this.getEndpoint();
      let overrideContract = name.indexOf('.') > -1;

      if (!overrideContract && endpoint.contract) {
         name = endpoint.contract + this._nameSpaceSeparator + name;
      }

      return new Transport({
         serviceUrl: endpoint.address
      }).callMethod(name, args);
   }
}

SbisBusinessLogic.prototype['[Types/_source/provider/SbisBusinessLogic]'] = true;
SbisBusinessLogic.prototype._$transport = RpcJson;
SbisBusinessLogic.prototype._nameSpaceSeparator = '.';

register('Types/source:provider.SbisBusinessLogic', SbisBusinessLogic, {instantiate: false});
