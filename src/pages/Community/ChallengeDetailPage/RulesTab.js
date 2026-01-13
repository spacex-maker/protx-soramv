import React from 'react';
import { Typography, Divider, Tag } from 'antd';
import { FormattedMessage } from 'react-intl';
import ReactMarkdown from 'react-markdown';
import { DetailCard, MarkdownContent } from './styled';
import { parseTags } from './utils';

const { Title } = Typography;

const RulesTab = ({ challenge }) => {
  const tags = challenge.requiredTags ? parseTags(challenge.requiredTags) : [];

  return (
    <DetailCard>
      <Title level={4}><FormattedMessage id="common.description" defaultMessage="Description" /></Title>
      <MarkdownContent>
        <ReactMarkdown>{challenge.description || ''}</ReactMarkdown>
      </MarkdownContent>
      
      <Divider />
      
      <Title level={4}><FormattedMessage id="challenge.requirements" defaultMessage="Requirements" /></Title>
      <ul style={{ lineHeight: 2, fontSize: 15 }}>
        <li><FormattedMessage id="challenge.req.original" defaultMessage="Original creations only." /></li>
        {challenge.requiredModel && (
          <li>
            <FormattedMessage 
              id="challenge.req.model" 
              defaultMessage="Must use model: {model}" 
              values={{model: <strong>{challenge.requiredModel}</strong>}} 
            />
          </li>
        )}
        {tags.length > 0 && (
          <li style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span><FormattedMessage id="challenge.req.tags" defaultMessage="Must include tags:" /></span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginLeft: 0 }}>
              {tags.map((tag, index) => (
                <Tag 
                  key={index} 
                  color="processing" 
                  style={{ 
                    margin: 0,
                    borderRadius: 4,
                    fontSize: 13,
                    padding: '2px 8px',
                    lineHeight: '20px'
                  }}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </li>
        )}
        <li><FormattedMessage id="challenge.req.resolution" defaultMessage="Resolution must be at least 1024x1024." /></li>
        <li><FormattedMessage id="challenge.req.nsfw" defaultMessage="No NSFW content." /></li>
      </ul>
    </DetailCard>
  );
};

export default RulesTab;

