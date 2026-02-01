import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Container } from "components/misc/Layouts";
import styled from "styled-components";
import SimpleHeader from "components/headers/simple";
import FooterSection from "./Home/components/FooterSection";
import { SectionHeading } from "components/misc/Headings";
import { base } from "api/base";

const PageWrapper = styled.div`
  .App {
    padding: 0 !important;
  }
`;

const StyledContainer = styled(Container)`
  position: relative;
  padding-top: 100px;
  
  @media (max-width: 768px) {
    padding-top: 80px;
  }
  
  @media (max-width: 480px) {
    padding-top: 60px;
  }
`;

const StyledContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 40px;
  
  @media (max-width: 768px) {
    padding: 60px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 40px 16px;
  }
`;

const HeadingRow = styled.div`
  display: flex;
`;

const Heading = styled(SectionHeading)`
  color: ${props => props.theme.mode === 'dark' ? '#f0f0f0' : '#1a1a1a'};
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
    font-size: 24px;
  }
`;

const Text = styled.div`
  font-size: 18px;
  line-height: 1.8;
  color: ${props => props.theme.mode === 'dark' ? '#e0e0e0' : '#333333'};
  word-wrap: break-word;
  overflow-wrap: break-word;
  
  @media (max-width: 768px) {
    font-size: 16px;
    line-height: 1.6;
  }
  
  p {
    margin-top: 8px;
    margin-bottom: 8px;
    line-height: 1.8;
    
    @media (max-width: 768px) {
      line-height: 1.6;
      margin-top: 6px;
      margin-bottom: 6px;
    }
  }
  
  h1 {
    font-size: 28px;
    font-weight: 700;
    margin-top: 40px;
    margin-bottom: 16px;
    color: ${props => props.theme.mode === 'dark' ? '#f0f0f0' : '#1a1a1a'};
    
    @media (max-width: 768px) {
      font-size: 22px;
      margin-top: 32px;
      margin-bottom: 12px;
    }
  }
  
  h2 {
    font-size: 24px;
    font-weight: 700;
    margin-top: 32px;
    margin-bottom: 12px;
    color: ${props => props.theme.mode === 'dark' ? '#f0f0f0' : '#1a1a1a'};
    
    @media (max-width: 768px) {
      font-size: 20px;
      margin-top: 24px;
      margin-bottom: 10px;
    }
  }
  
  h3 {
    font-size: 20px;
    font-weight: 700;
    margin-top: 24px;
    margin-bottom: 10px;
    color: ${props => props.theme.mode === 'dark' ? '#f0f0f0' : '#1a1a1a'};
    
    @media (max-width: 768px) {
      font-size: 18px;
      margin-top: 20px;
      margin-bottom: 8px;
    }
  }
  
  ul {
    list-style-type: disc;
    list-style-position: inside;
    padding-left: 0;
    margin: 16px 0;
    
    @media (max-width: 768px) {
      margin: 12px 0;
    }
    
    li {
      margin-left: 8px;
      margin-bottom: 12px;
      line-height: 1.8;
      
      @media (max-width: 768px) {
        margin-left: 4px;
        margin-bottom: 8px;
        line-height: 1.6;
      }
      
      p {
        margin-top: 0;
        margin-bottom: 0;
        display: inline;
        line-height: 1.6;
      }
    }
  }
  
  strong {
    font-weight: 600;
  }
`;

export default ({ headingText }) => {
  const intl = useIntl();
  const locale = intl.locale || 'zh_CN';
  const dateLocale = locale === 'zh_CN' ? 'zh-CN' : locale === 'en_US' ? 'en-US' : locale.split('_')[0] || 'en';
  const currentDate = new Date().toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' });
  const [officialEmail, setOfficialEmail] = useState('support@soramv.com');

  useEffect(() => {
    const fetchOfficialEmail = async () => {
      const result = await base.getOfficialEmail();
      if (result.success && result.data) {
        setOfficialEmail(result.data);
      }
    };
    fetchOfficialEmail();
  }, []);
  
  return (
    <PageWrapper>
      <SimpleHeader />
      <AnimationRevealPage>
        <StyledContainer>
          <StyledContentWrapper>
            <HeadingRow>
              <Heading>{headingText || intl.formatMessage({ id: 'termsOfService.title', defaultMessage: '服务条款' })}</Heading>
            </HeadingRow>
            <Text>
            <p>{intl.formatMessage({ id: 'termsOfService.lastUpdated', defaultMessage: '最后更新日期：{date}' }, { date: currentDate })}</p>

            <p>{intl.formatMessage({ id: 'termsOfService.intro', defaultMessage: '在使用我们的服务之前，请仔细阅读本服务条款。通过访问或使用 AI2OBJ 平台（以下简称"本平台"或"服务"），您同意受本服务条款的约束。如果您不同意本服务条款的任何部分，请不要使用我们的服务。' })}</p>

            <h1>{intl.formatMessage({ id: 'termsOfService.section1.title', defaultMessage: '一、定义与解释' })}</h1>
            <h2>{intl.formatMessage({ id: 'termsOfService.section1.1.title', defaultMessage: '1.1 定义' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section1.1.intro', defaultMessage: '在本服务条款中，除非上下文另有说明，下列术语具有以下含义：' })}</p>
            <ul>
              <li><strong>{intl.formatMessage({ id: 'termsOfService.section1.1.item1.label', defaultMessage: '"平台"或"本平台"' })}</strong>：{intl.formatMessage({ id: 'termsOfService.section1.1.item1.desc', defaultMessage: '指 AI2OBJ 综合 AI 创作平台，包括但不限于网站、移动应用及相关服务。' })}</li>
              <li><strong>{intl.formatMessage({ id: 'termsOfService.section1.1.item2.label', defaultMessage: '"我们"、"我方"、"公司"' })}</strong>：{intl.formatMessage({ id: 'termsOfService.section1.1.item2.desc', defaultMessage: '指 AI2OBJ 平台的运营方，即 ProTX Team。' })}</li>
              <li><strong>{intl.formatMessage({ id: 'termsOfService.section1.1.item3.label', defaultMessage: '"您"、"用户"' })}</strong>：{intl.formatMessage({ id: 'termsOfService.section1.1.item3.desc', defaultMessage: '指访问或使用本服务的个人、公司或其他法律实体。' })}</li>
              <li><strong>{intl.formatMessage({ id: 'termsOfService.section1.1.item4.label', defaultMessage: '"服务"' })}</strong>：{intl.formatMessage({ id: 'termsOfService.section1.1.item4.desc', defaultMessage: '指本平台提供的所有功能和服务，包括但不限于 AI 视频生成、模型选择、作品管理、用户账户管理等。' })}</li>
              <li><strong>{intl.formatMessage({ id: 'termsOfService.section1.1.item5.label', defaultMessage: '"内容"' })}</strong>：{intl.formatMessage({ id: 'termsOfService.section1.1.item5.desc', defaultMessage: '指用户通过本平台上传、生成、创建或分享的任何文本、图片、视频、音频等材料。' })}</li>
              <li><strong>{intl.formatMessage({ id: 'termsOfService.section1.1.item6.label', defaultMessage: '"生成内容"' })}</strong>：{intl.formatMessage({ id: 'termsOfService.section1.1.item6.desc', defaultMessage: '指用户使用本平台的 AI 模型生成的视频作品。' })}</li>
              <li><strong>{intl.formatMessage({ id: 'termsOfService.section1.1.item7.label', defaultMessage: '"账户"' })}</strong>：{intl.formatMessage({ id: 'termsOfService.section1.1.item7.desc', defaultMessage: '指用户在本平台注册的用户账户。' })}</li>
            </ul>

            <h1>{intl.formatMessage({ id: 'termsOfService.section2.title', defaultMessage: '二、服务说明' })}</h1>
            <h2>{intl.formatMessage({ id: 'termsOfService.section2.1.title', defaultMessage: '2.1 服务内容' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section2.1.intro', defaultMessage: '本平台提供基于 Sora 技术的 AI 视频生成服务，包括但不限于：' })}</p>
            <ul>
              <li>{intl.formatMessage({ id: 'termsOfService.section2.1.item1', defaultMessage: '文本生成视频（Text-to-Video）' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section2.1.item2', defaultMessage: '图片生成视频（Image-to-Video）' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section2.1.item3', defaultMessage: '视频作品管理和展示' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section2.1.item4', defaultMessage: '模型选择和管理' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section2.1.item5', defaultMessage: '用户账户和个人中心' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section2.1.item6', defaultMessage: '订阅和支付服务' })}</li>
            </ul>

            <h2>{intl.formatMessage({ id: 'termsOfService.section2.2.title', defaultMessage: '2.2 服务变更' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section2.2.content', defaultMessage: '我们保留随时修改、暂停或终止部分或全部服务的权利，无需事先通知。我们不对因服务变更而导致的任何损失承担责任。' })}</p>

            <h1>{intl.formatMessage({ id: 'termsOfService.section3.title', defaultMessage: '三、用户账户' })}</h1>
            <h2>{intl.formatMessage({ id: 'termsOfService.section3.1.title', defaultMessage: '3.1 账户注册' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section3.1.intro', defaultMessage: '使用本服务需要注册账户。注册时，您同意：' })}</p>
            <ul>
              <li>{intl.formatMessage({ id: 'termsOfService.section3.1.item1', defaultMessage: '提供真实、准确、完整的注册信息' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section3.1.item2', defaultMessage: '及时更新注册信息，保持其真实、准确、完整' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section3.1.item3', defaultMessage: '对账户下的所有活动负责' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section3.1.item4', defaultMessage: '妥善保管账户密码，不得将账户转让、出售或出借给他人' })}</li>
            </ul>

            <h2>{intl.formatMessage({ id: 'termsOfService.section3.2.title', defaultMessage: '3.2 年龄限制' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section3.2.content', defaultMessage: '您必须年满 18 周岁才能使用本服务。如果您未满 18 周岁，请在监护人同意和指导下使用本服务。' })}</p>

            <h2>{intl.formatMessage({ id: 'termsOfService.section3.3.title', defaultMessage: '3.3 账户安全' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section3.3.content', defaultMessage: '您有责任维护账户的安全。如发现账户被盗用或存在安全漏洞，请立即通知我们。我们不对因您未妥善保管账户信息而导致的损失承担责任。' })}</p>

            <h1>{intl.formatMessage({ id: 'termsOfService.section4.title', defaultMessage: '四、使用规范' })}</h1>
            <h2>{intl.formatMessage({ id: 'termsOfService.section4.1.title', defaultMessage: '4.1 禁止行为' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section4.1.intro', defaultMessage: '使用本服务时，您不得：' })}</p>
            <ul>
              <li>{intl.formatMessage({ id: 'termsOfService.section4.1.item1', defaultMessage: '生成、上传、分享任何违法、有害、威胁、辱骂、骚扰、诽谤、粗俗、淫秽、侵犯他人隐私或知识产权的内容' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section4.1.item2', defaultMessage: '生成、传播任何虚假信息、误导性内容或恶意内容' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section4.1.item3', defaultMessage: '使用本服务进行任何商业欺诈、洗钱或其他非法活动' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section4.1.item4', defaultMessage: '干扰或破坏本平台的正常运行，包括但不限于使用自动化工具、爬虫、病毒等' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section4.1.item5', defaultMessage: '未经授权访问本平台的任何系统、数据或账户' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section4.1.item6', defaultMessage: '复制、修改、分发、出售或租赁本平台的任何部分' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section4.1.item7', defaultMessage: '反向工程、反编译或反汇编本平台的任何软件' })}</li>
            </ul>

            <h2>{intl.formatMessage({ id: 'termsOfService.section4.2.title', defaultMessage: '4.2 内容责任' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section4.2.content', defaultMessage: '您对通过本平台生成、上传、分享的所有内容承担全部责任。我们不对用户生成的内容进行预先审查，但保留随时删除违规内容的权利。' })}</p>

            <h1>{intl.formatMessage({ id: 'termsOfService.section5.title', defaultMessage: '五、知识产权' })}</h1>
            <h2>{intl.formatMessage({ id: 'termsOfService.section5.1.title', defaultMessage: '5.1 平台知识产权' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section5.1.content', defaultMessage: '本平台的所有知识产权，包括但不限于商标、专利、版权、商业秘密等，均归我们或相关权利人所有。未经授权，您不得使用。' })}</p>

            <h2>{intl.formatMessage({ id: 'termsOfService.section5.2.title', defaultMessage: '5.2 用户生成内容' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section5.2.content', defaultMessage: '您通过本平台生成的内容，其知识产权归您所有。但您授予我们非独占、全球性、免费、可再许可的权利，以使用、展示、分发您的内容，用于提供和改进服务。' })}</p>

            <h2>{intl.formatMessage({ id: 'termsOfService.section5.3.title', defaultMessage: '5.3 AI 模型' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section5.3.content', defaultMessage: '本平台使用的 AI 模型（包括 Sora 模型）的知识产权归其开发者所有。您不得复制、修改或分发这些模型。' })}</p>

            <h1>{intl.formatMessage({ id: 'termsOfService.section6.title', defaultMessage: '六、付费服务' })}</h1>
            <h2>{intl.formatMessage({ id: 'termsOfService.section6.1.title', defaultMessage: '6.1 付费模式' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section6.1.content', defaultMessage: '本平台提供订阅和按次付费两种模式。具体价格和计费方式以平台公示为准。' })}</p>

            <h2>{intl.formatMessage({ id: 'termsOfService.section6.2.title', defaultMessage: '6.2 支付' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section6.2.content', defaultMessage: '您同意按照平台公示的价格支付服务费用。所有费用均以人民币或其他平台支持的货币计价。支付成功后，费用不予退还，除非法律另有规定或我们另有承诺。' })}</p>

            <h2>{intl.formatMessage({ id: 'termsOfService.section6.3.title', defaultMessage: '6.3 退款政策' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section6.3.content', defaultMessage: '除非法律另有规定或我们另有承诺，已支付的费用不予退还。如因平台原因导致服务无法正常使用，我们将根据实际情况提供退款或补偿。' })}</p>

            <h1>{intl.formatMessage({ id: 'termsOfService.section7.title', defaultMessage: '七、服务可用性' })}</h1>
            <h2>{intl.formatMessage({ id: 'termsOfService.section7.1.title', defaultMessage: '7.1 服务中断' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section7.1.intro', defaultMessage: '我们不对因以下原因导致的服务中断承担责任：' })}</p>
            <ul>
              <li>{intl.formatMessage({ id: 'termsOfService.section7.1.item1', defaultMessage: '系统维护、升级或故障' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section7.1.item2', defaultMessage: '不可抗力因素（如自然灾害、战争、罢工等）' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section7.1.item3', defaultMessage: '第三方服务提供商的问题' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section7.1.item4', defaultMessage: '网络故障或用户设备问题' })}</li>
            </ul>

            <h2>{intl.formatMessage({ id: 'termsOfService.section7.2.title', defaultMessage: '7.2 服务保证' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section7.2.content', defaultMessage: '我们尽力保证服务的稳定性和可用性，但不保证服务不会中断、无错误或完全安全。服务按"现状"和"可用"的基础提供，不提供任何明示或暗示的保证。' })}</p>

            <h1>{intl.formatMessage({ id: 'termsOfService.section8.title', defaultMessage: '八、隐私保护' })}</h1>
            <p>{intl.formatMessage({ id: 'termsOfService.section8.content', defaultMessage: '我们重视您的隐私保护。关于我们如何收集、使用和保护您的个人信息，请参阅我们的《隐私政策》。使用本服务即表示您同意我们的隐私政策。' })}</p>

            <h1>{intl.formatMessage({ id: 'termsOfService.section9.title', defaultMessage: '九、责任限制' })}</h1>
            <h2>{intl.formatMessage({ id: 'termsOfService.section9.1.title', defaultMessage: '9.1 责任范围' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section9.1.intro', defaultMessage: '在法律允许的最大范围内，我们对因使用或无法使用本服务而产生的任何直接、间接、偶然、特殊或后果性损害不承担责任，包括但不限于：' })}</p>
            <ul>
              <li>{intl.formatMessage({ id: 'termsOfService.section9.1.item1', defaultMessage: '利润损失、数据丢失或其他经济损失' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section9.1.item2', defaultMessage: '业务中断' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section9.1.item3', defaultMessage: '人身伤害或财产损失' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section9.1.item4', defaultMessage: '隐私泄露' })}</li>
            </ul>

            <h2>{intl.formatMessage({ id: 'termsOfService.section9.2.title', defaultMessage: '9.2 责任上限' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section9.2.content', defaultMessage: '我们的总责任不超过您在过去 12 个月内通过本服务实际支付的费用总额，或 100 美元（以较高者为准）。' })}</p>

            <h1>{intl.formatMessage({ id: 'termsOfService.section10.title', defaultMessage: '十、服务终止' })}</h1>
            <h2>{intl.formatMessage({ id: 'termsOfService.section10.1.title', defaultMessage: '10.1 用户终止' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section10.1.content', defaultMessage: '您可以随时停止使用本服务并注销账户。' })}</p>

            <h2>{intl.formatMessage({ id: 'termsOfService.section10.2.title', defaultMessage: '10.2 平台终止' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section10.2.intro', defaultMessage: '我们有权在以下情况下立即终止或暂停您的账户和服务：' })}</p>
            <ul>
              <li>{intl.formatMessage({ id: 'termsOfService.section10.2.item1', defaultMessage: '您违反本服务条款' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section10.2.item2', defaultMessage: '您从事任何非法活动' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section10.2.item3', defaultMessage: '您的账户长期未使用' })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section10.2.item4', defaultMessage: '法律或监管要求' })}</li>
            </ul>
            <p>{intl.formatMessage({ id: 'termsOfService.section10.2.note', defaultMessage: '服务终止后，您将无法访问账户和生成的内容，除非法律另有规定。' })}</p>

            <h1>{intl.formatMessage({ id: 'termsOfService.section11.title', defaultMessage: '十一、争议解决' })}</h1>
            <h2>{intl.formatMessage({ id: 'termsOfService.section11.1.title', defaultMessage: '11.1 协商解决' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section11.1.content', defaultMessage: '如发生争议，双方应首先通过友好协商解决。' })}</p>

            <h2>{intl.formatMessage({ id: 'termsOfService.section11.2.title', defaultMessage: '11.2 法律适用' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section11.2.content', defaultMessage: '本服务条款受中华人民共和国法律管辖。如双方无法协商解决争议，应提交至我们所在地有管辖权的人民法院解决。' })}</p>

            <h1>{intl.formatMessage({ id: 'termsOfService.section12.title', defaultMessage: '十二、其他条款' })}</h1>
            <h2>{intl.formatMessage({ id: 'termsOfService.section12.1.title', defaultMessage: '12.1 条款修改' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section12.1.content', defaultMessage: '我们保留随时修改本服务条款的权利。重大修改将在生效前至少 30 天通知您。继续使用服务即表示您接受修改后的条款。' })}</p>

            <h2>{intl.formatMessage({ id: 'termsOfService.section12.2.title', defaultMessage: '12.2 可分割性' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section12.2.content', defaultMessage: '如本服务条款的任何条款被认定为无效或不可执行，不影响其他条款的效力。' })}</p>

            <h2>{intl.formatMessage({ id: 'termsOfService.section12.3.title', defaultMessage: '12.3 完整协议' })}</h2>
            <p>{intl.formatMessage({ id: 'termsOfService.section12.3.content', defaultMessage: '本服务条款构成您与我们之间关于使用本服务的完整协议，取代所有先前的口头或书面协议。' })}</p>

            <h1>{intl.formatMessage({ id: 'termsOfService.section13.title', defaultMessage: '十三、联系我们' })}</h1>
            <p>{intl.formatMessage({ id: 'termsOfService.section13.intro', defaultMessage: '如您对本服务条款有任何疑问，请通过以下方式联系我们：' })}</p>
            <ul>
              <li>{intl.formatMessage({ id: 'termsOfService.section13.email', defaultMessage: '邮箱：{email}' }, { email: officialEmail })}</li>
              <li>{intl.formatMessage({ id: 'termsOfService.section13.hours', defaultMessage: '客服时间：工作日 9:00-18:00' })}</li>
            </ul>
            </Text>
          </StyledContentWrapper>
        </StyledContainer>
      </AnimationRevealPage>
      <FooterSection />
    </PageWrapper>
  );
};
