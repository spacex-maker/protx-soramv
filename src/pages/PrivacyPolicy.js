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
              <Heading>{headingText || intl.formatMessage({ id: 'privacyPolicy.title', defaultMessage: '隐私政策' })}</Heading>
            </HeadingRow>
            <Text>
            <p>{intl.formatMessage({ id: 'privacyPolicy.lastUpdated', defaultMessage: '最后更新日期：{date}' }, { date: currentDate })}</p>

            <p>
              {intl.formatMessage({ id: 'privacyPolicy.intro1', defaultMessage: '本隐私政策描述了 AI2OBJ 平台（以下简称"我们"或"本平台"）在您使用我们的服务时如何收集、使用、存储和保护您的个人信息，以及您的隐私权利。我们非常重视您的隐私保护，请仔细阅读本隐私政策。' })}
            </p>

            <p>
              {intl.formatMessage({ id: 'privacyPolicy.intro2', defaultMessage: '使用我们的服务即表示您同意本隐私政策。如果您不同意本隐私政策的任何内容，请不要使用我们的服务。' })}
            </p>

            <h1>{intl.formatMessage({ id: 'privacyPolicy.section1.title', defaultMessage: '一、我们收集的信息' })}</h1>
            <h2>{intl.formatMessage({ id: 'privacyPolicy.section1.1.title', defaultMessage: '1.1 您主动提供的信息' })}</h2>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section1.1.intro', defaultMessage: '在使用本服务时，您可能需要提供以下信息：' })}</p>
            <ul>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section1.1.item1.label', defaultMessage: '账户信息' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section1.1.item1.desc', defaultMessage: '用户名、邮箱地址、密码、手机号码等' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section1.1.item2.label', defaultMessage: '个人资料' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section1.1.item2.desc', defaultMessage: '头像、昵称、个人简介等（可选）' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section1.1.item3.label', defaultMessage: '支付信息' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section1.1.item3.desc', defaultMessage: '支付方式、账单地址等（用于处理支付）' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section1.1.item4.label', defaultMessage: '生成内容' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section1.1.item4.desc', defaultMessage: '您上传的文本提示词、参考图片、生成的视频等' })}</li>
            </ul>

            <h2>{intl.formatMessage({ id: 'privacyPolicy.section1.2.title', defaultMessage: '1.2 自动收集的信息' })}</h2>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section1.2.intro', defaultMessage: '当您使用本服务时，我们可能自动收集以下信息：' })}</p>
            <ul>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section1.2.item1.label', defaultMessage: '设备信息' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section1.2.item1.desc', defaultMessage: '设备类型、操作系统、浏览器类型和版本、设备标识符等' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section1.2.item2.label', defaultMessage: '使用数据' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section1.2.item2.desc', defaultMessage: '访问时间、访问页面、使用功能、操作记录等' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section1.2.item3.label', defaultMessage: '网络信息' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section1.2.item3.desc', defaultMessage: 'IP 地址、网络类型、网络运营商等' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section1.2.item4.label', defaultMessage: '日志信息' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section1.2.item4.desc', defaultMessage: '错误日志、性能数据等' })}</li>
            </ul>

            <h2>{intl.formatMessage({ id: 'privacyPolicy.section1.3.title', defaultMessage: '1.3 Cookie 和类似技术' })}</h2>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section1.3.intro', defaultMessage: '我们使用 Cookie 和类似技术来：' })}</p>
            <ul>
              <li>{intl.formatMessage({ id: 'privacyPolicy.section1.3.item1', defaultMessage: '保持您的登录状态' })}</li>
              <li>{intl.formatMessage({ id: 'privacyPolicy.section1.3.item2', defaultMessage: '记住您的偏好设置（如语言、主题等）' })}</li>
              <li>{intl.formatMessage({ id: 'privacyPolicy.section1.3.item3', defaultMessage: '分析服务使用情况，改进服务质量' })}</li>
              <li>{intl.formatMessage({ id: 'privacyPolicy.section1.3.item4', defaultMessage: '提供个性化体验' })}</li>
            </ul>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section1.3.note', defaultMessage: '您可以通过浏览器设置拒绝 Cookie，但这可能影响部分功能的使用。' })}</p>

            <h1>{intl.formatMessage({ id: 'privacyPolicy.section2.title', defaultMessage: '二、信息的使用目的' })}</h1>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section2.intro', defaultMessage: '我们收集和使用您的信息用于以下目的：' })}</p>
            <ul>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section2.item1.label', defaultMessage: '提供服务' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section2.item1.desc', defaultMessage: '处理您的视频生成请求、管理您的账户和作品等' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section2.item2.label', defaultMessage: '改进服务' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section2.item2.desc', defaultMessage: '分析使用情况，优化服务性能和用户体验' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section2.item3.label', defaultMessage: '账户管理' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section2.item3.desc', defaultMessage: '验证身份、处理支付、发送通知等' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section2.item4.label', defaultMessage: '安全保障' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section2.item4.desc', defaultMessage: '检测和防范欺诈、滥用、安全威胁等' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section2.item5.label', defaultMessage: '客户支持' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section2.item5.desc', defaultMessage: '响应您的咨询、处理投诉和反馈等' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section2.item6.label', defaultMessage: '法律合规' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section2.item6.desc', defaultMessage: '遵守法律法规要求，配合执法部门调查等' })}</li>
            </ul>

            <h1>{intl.formatMessage({ id: 'privacyPolicy.section3.title', defaultMessage: '三、信息的共享与披露' })}</h1>
            <h2>{intl.formatMessage({ id: 'privacyPolicy.section3.1.title', defaultMessage: '3.1 我们不会出售您的个人信息' })}</h2>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section3.1.content', defaultMessage: '我们不会向第三方出售、出租或以其他方式交易您的个人信息。' })}</p>

            <h2>{intl.formatMessage({ id: 'privacyPolicy.section3.2.title', defaultMessage: '3.2 服务提供商' })}</h2>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section3.2.intro', defaultMessage: '我们可能与以下类型的服务提供商共享信息：' })}</p>
            <ul>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section3.2.item1.label', defaultMessage: '云服务提供商' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section3.2.item1.desc', defaultMessage: '用于存储和处理数据' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section3.2.item2.label', defaultMessage: '支付服务提供商' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section3.2.item2.desc', defaultMessage: '用于处理支付交易' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section3.2.item3.label', defaultMessage: '分析服务提供商' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section3.2.item3.desc', defaultMessage: '用于分析服务使用情况' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section3.2.item4.label', defaultMessage: '客户支持服务提供商' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section3.2.item4.desc', defaultMessage: '用于提供客户支持' })}</li>
            </ul>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section3.2.note', defaultMessage: '这些服务提供商只能将信息用于向我们提供服务，不得用于其他目的。' })}</p>

            <h2>{intl.formatMessage({ id: 'privacyPolicy.section3.3.title', defaultMessage: '3.3 法律要求' })}</h2>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section3.3.intro', defaultMessage: '在以下情况下，我们可能披露您的信息：' })}</p>
            <ul>
              <li>{intl.formatMessage({ id: 'privacyPolicy.section3.3.item1', defaultMessage: '遵守法律法规、法院命令或政府要求' })}</li>
              <li>{intl.formatMessage({ id: 'privacyPolicy.section3.3.item2', defaultMessage: '保护我们的权利、财产或安全' })}</li>
              <li>{intl.formatMessage({ id: 'privacyPolicy.section3.3.item3', defaultMessage: '防止或调查可能的违法行为' })}</li>
              <li>{intl.formatMessage({ id: 'privacyPolicy.section3.3.item4', defaultMessage: '保护用户或公众的安全' })}</li>
            </ul>

            <h2>{intl.formatMessage({ id: 'privacyPolicy.section3.4.title', defaultMessage: '3.4 业务转让' })}</h2>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section3.4.content', defaultMessage: '如果发生合并、收购或资产转让，您的信息可能会被转移。我们会在转移前通知您。' })}</p>

            <h1>{intl.formatMessage({ id: 'privacyPolicy.section4.title', defaultMessage: '四、信息的存储与安全' })}</h1>
            <h2>{intl.formatMessage({ id: 'privacyPolicy.section4.1.title', defaultMessage: '4.1 存储地点' })}</h2>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section4.1.content', defaultMessage: '您的信息可能存储在位于中华人民共和国境内或境外的服务器上。我们会采取适当措施确保信息的安全。' })}</p>

            <h2>{intl.formatMessage({ id: 'privacyPolicy.section4.2.title', defaultMessage: '4.2 存储期限' })}</h2>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section4.2.intro', defaultMessage: '我们仅在必要期间内保留您的信息：' })}</p>
            <ul>
              <li>{intl.formatMessage({ id: 'privacyPolicy.section4.2.item1', defaultMessage: '账户信息：在您账户存续期间及注销后的一段时间内' })}</li>
              <li>{intl.formatMessage({ id: 'privacyPolicy.section4.2.item2', defaultMessage: '生成内容：根据您的设置或法律要求保留' })}</li>
              <li>{intl.formatMessage({ id: 'privacyPolicy.section4.2.item3', defaultMessage: '使用数据：通常保留较短时间，用于分析和改进服务' })}</li>
            </ul>

            <h2>{intl.formatMessage({ id: 'privacyPolicy.section4.3.title', defaultMessage: '4.3 安全措施' })}</h2>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section4.3.intro', defaultMessage: '我们采取以下安全措施保护您的信息：' })}</p>
            <ul>
              <li>{intl.formatMessage({ id: 'privacyPolicy.section4.3.item1', defaultMessage: '加密传输和存储' })}</li>
              <li>{intl.formatMessage({ id: 'privacyPolicy.section4.3.item2', defaultMessage: '访问控制和身份验证' })}</li>
              <li>{intl.formatMessage({ id: 'privacyPolicy.section4.3.item3', defaultMessage: '定期安全审计和漏洞扫描' })}</li>
              <li>{intl.formatMessage({ id: 'privacyPolicy.section4.3.item4', defaultMessage: '员工培训和保密协议' })}</li>
            </ul>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section4.3.note', defaultMessage: '请注意，没有任何安全措施是 100% 安全的。我们无法保证信息的绝对安全。' })}</p>

            <h1>{intl.formatMessage({ id: 'privacyPolicy.section5.title', defaultMessage: '五、您的权利' })}</h1>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section5.intro', defaultMessage: '根据适用的法律法规，您享有以下权利：' })}</p>
            <ul>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section5.item1.label', defaultMessage: '访问权' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section5.item1.desc', defaultMessage: '查看我们持有的您的个人信息' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section5.item2.label', defaultMessage: '更正权' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section5.item2.desc', defaultMessage: '更正不准确或不完整的信息' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section5.item3.label', defaultMessage: '删除权' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section5.item3.desc', defaultMessage: '要求删除您的个人信息（法律要求保留的除外）' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section5.item4.label', defaultMessage: '撤回同意' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section5.item4.desc', defaultMessage: '撤回您对信息处理的同意' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section5.item5.label', defaultMessage: '数据可携权' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section5.item5.desc', defaultMessage: '获取您的个人信息副本' })}</li>
              <li><strong>{intl.formatMessage({ id: 'privacyPolicy.section5.item6.label', defaultMessage: '反对权' })}</strong>：{intl.formatMessage({ id: 'privacyPolicy.section5.item6.desc', defaultMessage: '反对某些信息处理活动' })}</li>
            </ul>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section5.note', defaultMessage: '如需行使上述权利，请通过本隐私政策末尾的联系方式联系我们。' })}</p>

            <h1>{intl.formatMessage({ id: 'privacyPolicy.section6.title', defaultMessage: '六、未成年人保护' })}</h1>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section6.content1', defaultMessage: '本服务主要面向 18 周岁以上的用户。如果您未满 18 周岁，请在监护人同意和指导下使用本服务。' })}</p>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section6.content2', defaultMessage: '如果我们发现收集了未满 18 周岁用户的个人信息，且未获得监护人同意，我们会尽快删除相关信息。' })}</p>

            <h1>{intl.formatMessage({ id: 'privacyPolicy.section7.title', defaultMessage: '七、第三方链接' })}</h1>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section7.content', defaultMessage: '本服务可能包含指向第三方网站的链接。我们不对这些第三方网站的隐私做法负责。访问这些网站时，请查看其隐私政策。' })}</p>

            <h1>{intl.formatMessage({ id: 'privacyPolicy.section8.title', defaultMessage: '八、隐私政策的变更' })}</h1>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section8.content1', defaultMessage: '我们可能不时更新本隐私政策。重大变更将在生效前至少 30 天通知您。继续使用服务即表示您接受更新后的隐私政策。' })}</p>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section8.content2', defaultMessage: '我们会在本页面顶部更新"最后更新日期"，并通过邮件或站内通知告知您重要变更。' })}</p>

            <h1>{intl.formatMessage({ id: 'privacyPolicy.section9.title', defaultMessage: '九、联系我们' })}</h1>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section9.intro', defaultMessage: '如您对本隐私政策有任何疑问、意见或投诉，请通过以下方式联系我们：' })}</p>
            <ul>
              <li>{intl.formatMessage({ id: 'privacyPolicy.section9.email', defaultMessage: '邮箱：{email}' }, { email: officialEmail })}</li>
              <li>{intl.formatMessage({ id: 'privacyPolicy.section9.hours', defaultMessage: '客服时间：工作日 9:00-18:00' })}</li>
            </ul>
            <p>{intl.formatMessage({ id: 'privacyPolicy.section9.response', defaultMessage: '我们会在合理时间内回复您的请求。' })}</p>
            </Text>
          </StyledContentWrapper>
        </StyledContainer>
      </AnimationRevealPage>
      <FooterSection />
    </PageWrapper>
  );
};
