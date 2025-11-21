import React from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { motion } from "framer-motion";
import Header from "components/headers/light.js";
import Footer from "components/footers/FiveColumnWithBackground.js";

const Container = tw.div`relative min-h-screen bg-gray-100 dark:bg-gray-900`;

const Content = tw.div`max-w-screen-xl mx-auto py-20 lg:py-24 px-4`;

const BackgroundDecoration = styled(motion.div)`
  ${tw`pointer-events-none opacity-5 absolute inset-0`}
  background-image: radial-gradient(circle at 50% 50%, primary 1px, transparent 1px);
  background-size: 28px 28px;
`;

const TwoColumn = tw.div`flex flex-col lg:flex-row items-center max-w-screen-xl mx-auto py-12 md:py-16`;
const LeftColumn = tw.div`relative lg:w-6/12 lg:pr-12 flex-shrink-0 text-center lg:text-left`;
const RightColumn = tw.div`relative mt-12 lg:mt-0 flex flex-col justify-center`;

const Heading = tw.h1`font-bold text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-gray-900 dark:text-gray-100 leading-tight`;
const Paragraph = tw.p`my-5 lg:my-8 text-base xl:text-lg text-gray-600 dark:text-gray-400`;

const IllustrationContainer = styled(motion.div)`
  ${tw`flex justify-center lg:justify-end items-center`}
  img {
    ${tw`rounded-lg shadow-xl max-w-full w-96 h-auto`}
  }
`;

const DecoratorBlob = styled(motion.div)`
  ${tw`pointer-events-none opacity-10 absolute right-0 top-0 h-64 w-64 transform translate-x-32 translate-y-12 fill-current text-primary-500`}
`;

const Features = tw.div`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-screen-lg mx-auto`;
const Feature = tw.div`flex flex-col items-center text-center`;
const FeatureIcon = tw.div`w-16 h-16 flex items-center justify-center rounded-full bg-primary-100 text-primary-500 mb-4`;
const FeatureHeading = tw.h3`text-xl font-bold text-gray-900 dark:text-gray-100`;
const FeatureText = tw.p`mt-2 text-gray-600 dark:text-gray-400`;

const Values = tw.div`mt-20`;
const Value = tw.div`mt-10 first:mt-0`;
const ValueHeading = tw.h3`text-2xl font-bold text-gray-900 dark:text-gray-100`;
const ValueDescription = tw.p`mt-4 text-gray-600 dark:text-gray-400`;

export default () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.2 }
    }
  };

  return (
    <Container>
      <Header />
      <BackgroundDecoration 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 1 }}
      />
      <Content>
        <TwoColumn>
          <LeftColumn>
            <Heading>
              打造下一代
              <br />
              <span tw="text-primary-500">革命性产品</span>
            </Heading>
            <Paragraph>
              我们是一支充满激情的技术开发团队，致力于提供简单、易用、美观的下一代应用。
              我们相信，优秀的产品应该是简单而强大的，能够真正解决用户的问题。
            </Paragraph>
          </LeftColumn>
          <RightColumn>
            <IllustrationContainer
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img 
                src="/images/team-photo.jpg" 
                alt="Our Team"
                tw="rounded-lg shadow-xl"
              />
              <DecoratorBlob />
            </IllustrationContainer>
          </RightColumn>
        </TwoColumn>

        <Features
          as={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Feature>
            <FeatureIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </FeatureIcon>
            <FeatureHeading>简单易用</FeatureHeading>
            <FeatureText>
              我们追求极简设计，让每个功能都触手可及，每个操作都自然流畅。
            </FeatureText>
          </Feature>
          <Feature>
            <FeatureIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </FeatureIcon>
            <FeatureHeading>美观设计</FeatureHeading>
            <FeatureText>
              精心打磨每一个细节，让用户在使用过程中感受到美的愉悦。
            </FeatureText>
          </Feature>
          <Feature>
            <FeatureIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </FeatureIcon>
            <FeatureHeading>革新体验</FeatureHeading>
            <FeatureText>
              不断探索新技术，为用户带来前所未有的产品体验。
            </FeatureText>
          </Feature>
        </Features>

        <Values
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Value>
            <ValueHeading>我们的愿景</ValueHeading>
            <ValueDescription>
              我们致力于成为城市服务的创新者和引领者。通过技术创新和精心设计，我们希望能为用户提供更便捷、更智能的生活方式。我们相信，好的产品应该能够真正改善人们的生活。
            </ValueDescription>
          </Value>
          <Value>
            <ValueHeading>产品理念</ValueHeading>
            <ValueDescription>
              极致的用户体验是我们永恒的追求。我们深知，真正优秀的产品不仅要功能强大，更要简单易用。我们将每一个产品都视为艺术品，精心雕琢每一个细节，只为给用户最好的体验。
            </ValueDescription>
          </Value>
          <Value>
            <ValueHeading>技术创新</ValueHeading>
            <ValueDescription>
              作为一支技术驱动的团队，我们始终走在创新的前沿。我们不断探索新技术、新方法，努力打造下一代革命性的产品。我们相信，通过技术创新，我们能够为用户创造更多可能。
            </ValueDescription>
          </Value>
        </Values>
      </Content>
      <Footer />
    </Container>
  );
}; 