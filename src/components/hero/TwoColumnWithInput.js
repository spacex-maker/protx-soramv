import React, { useEffect, useState } from 'react';
import styled from "styled-components";
import tw from "twin.macro";
import { css } from "styled-components/macro";
import Header from "../headers/light.js";

import { ReactComponent as SvgDecoratorBlob1 } from "../../images/svg-decorator-blob-1.svg";
import heroBg from "../../images/pexels-apasaric-3629227.jpg";
import CustomersLogoStripImage from "../../images/customers-logo-strip.png";

// 修改 Container 样式，添加背景图
const Container = styled.div`
  ${tw`relative min-h-screen -m-8`}
  background-image: url(${props => props.backgroundImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  &:before {
    ${tw`absolute inset-0 bg-black transition-all ease-in-out -z-10`}
    content: "";
    opacity: ${props => props.overlayOpacity};
    transition-duration: 2s;
  }
`;

// 修改其他样式以适应深色背景
const TwoColumn = tw.div`relative z-10 flex flex-col lg:flex-row lg:items-center max-w-screen-xl mx-auto py-20 md:py-24`;
const LeftColumn = tw.div`relative lg:w-5/12 text-center max-w-lg mx-auto lg:max-w-none lg:text-left`;
const RightColumn = tw.div`relative mt-12 lg:mt-0 flex-1 flex flex-col justify-center lg:self-end`;

const Heading = tw.h1`font-bold text-3xl md:text-3xl lg:text-4xl xl:text-5xl text-white leading-tight`;
const Paragraph = tw.p`my-5 lg:my-8 text-base xl:text-lg text-white opacity-75`;

const Actions = styled.div`
  ${tw`relative max-w-md text-center mx-auto lg:mx-0`}
  input {
    ${tw`sm:pr-48 pl-8 py-4 sm:py-5 rounded-full border-2 w-full font-medium focus:outline-none transition duration-300 focus:border-primary-500 hover:border-gray-500`}
  }
  button {
    ${tw`w-full sm:absolute right-0 top-0 bottom-0 bg-primary-500 text-gray-100 font-bold mr-2 my-4 sm:my-2 rounded-full py-4 flex items-center justify-center sm:w-40 sm:leading-none focus:outline-none hover:bg-primary-900 transition duration-300`}
  }
`;

const CustomersLogoStrip = styled.div`
  ${tw`mt-12 lg:mt-20`}
  p {
    ${tw`uppercase text-sm lg:text-xs tracking-wider font-bold text-white opacity-75`}
  }
  img {
    ${tw`mt-4 w-full lg:pr-16 xl:pr-32 opacity-50`}
  }
`;

// 添加 DecoratorBlob1 的样式定义
const DecoratorBlob1 = styled(SvgDecoratorBlob1)`
  ${tw`pointer-events-none opacity-5 absolute left-0 bottom-0 h-64 w-64 transform -translate-x-2/3 -z-10`}
`;

// 修改 Header 容器的 z-index
const HeaderContainer = tw.div`
  relative z-20
`;

export default ({ 
  roundedHeaderButton,
  backgroundImageSrc = heroBg,
  heading = "专业的软件开发服务",
  description = "我们提供专业的软件开发和技术咨询服务，帮助企业实现数字化转型。",
  primaryButtonText = "立即咨询",
  primaryButtonUrl = "#",
  inputPlaceholder = "您的电子邮箱"
}) => {
  const [overlayOpacity, setOverlayOpacity] = useState(0.7);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setOverlayOpacity(0.4);
    }, 0);

    const timer2 = setTimeout(() => {
      setOverlayOpacity(0);
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <>
      <Container backgroundImage={backgroundImageSrc} overlayOpacity={overlayOpacity}>
        <HeaderContainer>
          <Header roundedHeaderButton={roundedHeaderButton} />
        </HeaderContainer>
        <TwoColumn>
          <LeftColumn>
            <Heading>{heading}</Heading>
            <Paragraph>{description}</Paragraph>
            <Actions>
              <input type="text" placeholder={inputPlaceholder} />
              <button>{primaryButtonText}</button>
            </Actions>
            <CustomersLogoStrip>
              <p>我们的合作伙伴</p>
              <img src={CustomersLogoStripImage} alt="Our Customers" />
            </CustomersLogoStrip>
          </LeftColumn>
        </TwoColumn>
        <DecoratorBlob1 />
      </Container>
    </>
  );
};
