import React, { useState, useEffect } from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Container, ContentWithPaddingXl } from "components/misc/Layouts";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro"; //eslint-disable-line
import SimpleHeader from "components/headers/simple";
import { SectionHeading } from "components/misc/Headings";
import { base } from "api/base";

const HeadingRow = tw.div`flex`;
const Heading = tw(SectionHeading)`text-gray-900 dark:text-gray-100 mb-10`;
const Text = styled.div`
  ${tw`text-lg text-gray-800 dark:text-gray-200`}
  p {
    ${tw`mt-2 leading-loose`}
  }
  h1 {
    ${tw`text-3xl font-bold mt-10`}
  }
  h2 {
    ${tw`text-2xl font-bold mt-8`}
  }
  h3 {
    ${tw`text-xl font-bold mt-6`}
  }
  ul {
    ${tw`list-disc list-inside`}
    li {
      ${tw`ml-2 mb-3`}
      p {
        ${tw`mt-0 inline leading-normal`}
      }
    }
  }
`;
export default ({ headingText = "隐私政策" }) => {
  const currentDate = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  const [officialEmail, setOfficialEmail] = useState('privacy@soramv.com');

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
    <AnimationRevealPage>
      <SimpleHeader />
      <Container style={{ paddingTop: '100px' }}>
        <ContentWithPaddingXl>
          <HeadingRow>
            <Heading>{headingText}</Heading>
          </HeadingRow>
          <Text>
            <p>最后更新日期：{currentDate}</p>

            <p>
              本隐私政策描述了 Sora MV 平台（以下简称"我们"或"本平台"）在您使用我们的服务时如何收集、使用、存储和保护您的个人信息，以及您的隐私权利。我们非常重视您的隐私保护，请仔细阅读本隐私政策。
            </p>

            <p>
              使用我们的服务即表示您同意本隐私政策。如果您不同意本隐私政策的任何内容，请不要使用我们的服务。
            </p>

            <h1>一、我们收集的信息</h1>
            <h2>1.1 您主动提供的信息</h2>
            <p>在使用本服务时，您可能需要提供以下信息：</p>
            <ul>
              <li><strong>账户信息</strong>：用户名、邮箱地址、密码、手机号码等</li>
              <li><strong>个人资料</strong>：头像、昵称、个人简介等（可选）</li>
              <li><strong>支付信息</strong>：支付方式、账单地址等（用于处理支付）</li>
              <li><strong>生成内容</strong>：您上传的文本提示词、参考图片、生成的视频等</li>
            </ul>

            <h2>1.2 自动收集的信息</h2>
            <p>当您使用本服务时，我们可能自动收集以下信息：</p>
            <ul>
              <li><strong>设备信息</strong>：设备类型、操作系统、浏览器类型和版本、设备标识符等</li>
              <li><strong>使用数据</strong>：访问时间、访问页面、使用功能、操作记录等</li>
              <li><strong>网络信息</strong>：IP 地址、网络类型、网络运营商等</li>
              <li><strong>日志信息</strong>：错误日志、性能数据等</li>
            </ul>

            <h2>1.3 Cookie 和类似技术</h2>
            <p>我们使用 Cookie 和类似技术来：</p>
            <ul>
              <li>保持您的登录状态</li>
              <li>记住您的偏好设置（如语言、主题等）</li>
              <li>分析服务使用情况，改进服务质量</li>
              <li>提供个性化体验</li>
            </ul>
            <p>您可以通过浏览器设置拒绝 Cookie，但这可能影响部分功能的使用。</p>

            <h1>二、信息的使用目的</h1>
            <p>我们收集和使用您的信息用于以下目的：</p>
            <ul>
              <li><strong>提供服务</strong>：处理您的视频生成请求、管理您的账户和作品等</li>
              <li><strong>改进服务</strong>：分析使用情况，优化服务性能和用户体验</li>
              <li><strong>账户管理</strong>：验证身份、处理支付、发送通知等</li>
              <li><strong>安全保障</strong>：检测和防范欺诈、滥用、安全威胁等</li>
              <li><strong>客户支持</strong>：响应您的咨询、处理投诉和反馈等</li>
              <li><strong>法律合规</strong>：遵守法律法规要求，配合执法部门调查等</li>
            </ul>

            <h1>三、信息的共享与披露</h1>
            <h2>3.1 我们不会出售您的个人信息</h2>
            <p>我们不会向第三方出售、出租或以其他方式交易您的个人信息。</p>

            <h2>3.2 服务提供商</h2>
            <p>我们可能与以下类型的服务提供商共享信息：</p>
            <ul>
              <li><strong>云服务提供商</strong>：用于存储和处理数据</li>
              <li><strong>支付服务提供商</strong>：用于处理支付交易</li>
              <li><strong>分析服务提供商</strong>：用于分析服务使用情况</li>
              <li><strong>客户支持服务提供商</strong>：用于提供客户支持</li>
            </ul>
            <p>这些服务提供商只能将信息用于向我们提供服务，不得用于其他目的。</p>

            <h2>3.3 法律要求</h2>
            <p>在以下情况下，我们可能披露您的信息：</p>
            <ul>
              <li>遵守法律法规、法院命令或政府要求</li>
              <li>保护我们的权利、财产或安全</li>
              <li>防止或调查可能的违法行为</li>
              <li>保护用户或公众的安全</li>
            </ul>

            <h2>3.4 业务转让</h2>
            <p>如果发生合并、收购或资产转让，您的信息可能会被转移。我们会在转移前通知您。</p>

            <h1>四、信息的存储与安全</h1>
            <h2>4.1 存储地点</h2>
            <p>您的信息可能存储在位于中华人民共和国境内或境外的服务器上。我们会采取适当措施确保信息的安全。</p>

            <h2>4.2 存储期限</h2>
            <p>我们仅在必要期间内保留您的信息：</p>
            <ul>
              <li>账户信息：在您账户存续期间及注销后的一段时间内</li>
              <li>生成内容：根据您的设置或法律要求保留</li>
              <li>使用数据：通常保留较短时间，用于分析和改进服务</li>
            </ul>

            <h2>4.3 安全措施</h2>
            <p>我们采取以下安全措施保护您的信息：</p>
            <ul>
              <li>加密传输和存储</li>
              <li>访问控制和身份验证</li>
              <li>定期安全审计和漏洞扫描</li>
              <li>员工培训和保密协议</li>
            </ul>
            <p>请注意，没有任何安全措施是 100% 安全的。我们无法保证信息的绝对安全。</p>

            <h1>五、您的权利</h1>
            <p>根据适用的法律法规，您享有以下权利：</p>
            <ul>
              <li><strong>访问权</strong>：查看我们持有的您的个人信息</li>
              <li><strong>更正权</strong>：更正不准确或不完整的信息</li>
              <li><strong>删除权</strong>：要求删除您的个人信息（法律要求保留的除外）</li>
              <li><strong>撤回同意</strong>：撤回您对信息处理的同意</li>
              <li><strong>数据可携权</strong>：获取您的个人信息副本</li>
              <li><strong>反对权</strong>：反对某些信息处理活动</li>
            </ul>
            <p>如需行使上述权利，请通过本隐私政策末尾的联系方式联系我们。</p>

            <h1>六、未成年人保护</h1>
            <p>本服务主要面向 18 周岁以上的用户。如果您未满 18 周岁，请在监护人同意和指导下使用本服务。</p>
            <p>如果我们发现收集了未满 18 周岁用户的个人信息，且未获得监护人同意，我们会尽快删除相关信息。</p>

            <h1>七、第三方链接</h1>
            <p>本服务可能包含指向第三方网站的链接。我们不对这些第三方网站的隐私做法负责。访问这些网站时，请查看其隐私政策。</p>

            <h1>八、隐私政策的变更</h1>
            <p>我们可能不时更新本隐私政策。重大变更将在生效前至少 30 天通知您。继续使用服务即表示您接受更新后的隐私政策。</p>
            <p>我们会在本页面顶部更新"最后更新日期"，并通过邮件或站内通知告知您重要变更。</p>

            <h1>九、联系我们</h1>
            <p>如您对本隐私政策有任何疑问、意见或投诉，请通过以下方式联系我们：</p>
            <ul>
              <li>邮箱：{officialEmail}</li>
              <li>客服时间：工作日 9:00-18:00</li>
            </ul>
            <p>我们会在合理时间内回复您的请求。</p>
          </Text>
        </ContentWithPaddingXl>
      </Container>
    </AnimationRevealPage>
  );
};
