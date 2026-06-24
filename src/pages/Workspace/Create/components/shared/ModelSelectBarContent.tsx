import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';

import {

  isModelFree,

  ModelSelectBillingMode,

  ModelSelectDisplayData,

  resolveModelBrand,

} from './modelSelectDisplayUtils';



export interface ModelSelectBarContentProps {

  model: ModelSelectDisplayData;

  billingMode?: ModelSelectBillingMode;

  showBrand?: boolean;

}



/**

 * 模型展示条内部文案布局（文生图 / 文生视频共用）

 * 左侧：名称 + 代码；右侧：价格 + 商标

 */

const ModelSelectBarContent: React.FC<ModelSelectBarContentProps> = ({

  model,

  billingMode = 'image',

  showBrand = true,

}) => {

  const intl = useIntl();

  const displayName = model.nameSuffix

    ? `${model.modelName}${model.nameSuffix}`

    : model.modelName;

  const brand = showBrand ? resolveModelBrand(model.companyName, model.modelName) : null;



  const renderPrice = () => {

    if (billingMode === 'video') {

      if (model.tokenCost == null) return null;

      return (

        <div className="model-display-price">

          <span className="model-display-price-amount">{model.tokenCost}</span>

          <span className="model-display-price-currency">Token</span>

          <span className="model-display-price-unit">

            <FormattedMessage id="create.model.price.perSecond" defaultMessage="/秒" />

          </span>

        </div>

      );

    }



    if (billingMode === 'speech') {

      if (model.tokenCost == null) return null;

      return (

        <div className="model-display-price">

          <span className="model-display-price-amount">{model.tokenCost}</span>

          <span className="model-display-price-currency">Token</span>

          <span className="model-display-price-unit">

            {model.tokenUnit === 'char' ? (

              <FormattedMessage id="create.model.price.perChar" defaultMessage="/字" />

            ) : (

              <FormattedMessage id="create.model.price.perSecond" defaultMessage="/秒" />

            )}

          </span>

        </div>

      );

    }



    if (isModelFree(model.outputPrice, model.currency, model.tokenCost)) {

      return (

        <div className="model-display-price model-display-free">

          {intl.formatMessage({ id: 'create.model.free', defaultMessage: '免费' })}

        </div>

      );

    }



    if (model.tokenCost != null && model.tokenCost > 0) {

      return (

        <div className="model-display-price">

          <span className="model-display-price-amount">{model.tokenCost}</span>

          <span className="model-display-price-currency">

            {intl.formatMessage({ id: 'create.model.token', defaultMessage: ' token' })}

          </span>

        </div>

      );

    }



    if (model.outputPrice != null) {

      return (

        <div className="model-display-price">

          <span className="model-display-price-amount">{model.outputPrice}</span>

          <span className="model-display-price-currency">{model.currency || 'USD'}</span>

          <span className="model-display-price-unit">

            <FormattedMessage id="create.model.price.perImage" defaultMessage="/张" />

          </span>

        </div>

      );

    }



    return null;

  };



  const price = renderPrice();



  return (

    <div className="model-display-content">

      <div className="model-display-main">

        <div className="model-display-name" title={displayName}>

          {displayName}

        </div>

        {model.modelCode ? (

          <div className="model-display-code">{model.modelCode}</div>

        ) : null}

      </div>

      {(price || brand) && (

        <div className="model-display-meta">

          {price}

          {brand ? <span className="model-display-brand">{brand}</span> : null}

        </div>

      )}

    </div>

  );

};



export default ModelSelectBarContent;

