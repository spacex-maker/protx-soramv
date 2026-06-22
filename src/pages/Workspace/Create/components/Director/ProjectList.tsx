import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowRightOutlined,
  PlusOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import directorApi, { DirectorProject } from 'api/director';
import { POSTER_ASPECT_RATIO } from './CoverImageUpload';

const { Title, Text, Paragraph } = Typography;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
`;

const HeaderMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const HeaderAction = styled.div`
  flex-shrink: 0;
  margin-left: auto;
`;

const PageTitle = styled(Title)`
  && {
    margin: 0;
    font-weight: 600;
  }
`;

const PageSubtitle = styled(Paragraph)`
  && {
    margin: 8px 0 0;
    max-width: 560px;
  }
`;

const ProjectGrid = styled(Row)`
  width: 100%;
`;

const ProjectCard = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
    border-color: rgba(59, 130, 246, 0.25);
  }

  &:hover .project-cover img {
    transform: scale(1.04);
  }

  &:hover .project-enter-hint {
    opacity: 1;
    transform: translateY(0);
  }

  .dark & {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.08);

    &:hover {
      border-color: rgba(59, 130, 246, 0.45);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
    }
  }
`;

const ProjectCover = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: ${POSTER_ASPECT_RATIO};
  overflow: hidden;
  background: linear-gradient(145deg, #6366f1 0%, #8b5cf6 45%, #a855f7 100%);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.35s ease;
  }
`;

const CoverPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.92);
  font-size: 48px;
`;

const CoverOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 14px 14px 12px;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 35%,
    rgba(0, 0, 0, 0.55) 72%,
    rgba(0, 0, 0, 0.78) 100%
  );
  pointer-events: none;
`;

const CoverTitle = styled.div`
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
`;

const CoverMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const CoverTag = styled(Tag)`
  && {
    margin: 0;
    border: none;
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
    backdrop-filter: blur(4px);
  }
`;

const ProjectEnterHint = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: #fff;
  background: rgba(59, 130, 246, 0.88);
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
`;

const ProjectCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px 14px;
  min-height: 72px;
`;

const ProjectStyleText = styled(Text)`
  && {
    display: block;
    font-size: 12px;
    line-height: 1.5;
  }
`;

const ProjectFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
`;

const EmptyWrap = styled.div`
  padding: 72px 24px;
  border-radius: 12px;
  border: 1px dashed rgba(0, 0, 0, 0.12);
  background: rgba(0, 0, 0, 0.02);

  .dark & {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.03);
  }
`;

const ASPECT_OPTIONS = [
  { value: '9:16', label: '9:16 竖屏' },
  { value: '16:9', label: '16:9 横屏' },
  { value: '1:1', label: '1:1 方形' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
];

const aspectLabelMap = Object.fromEntries(ASPECT_OPTIONS.map((o) => [o.value, o.label]));

const formatDateLabel = (locale: string, value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
};

const ProjectList: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<DirectorProject[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  const aspectOptions = useMemo(
    () =>
      ASPECT_OPTIONS.map((item) => ({
        value: item.value,
        label: intl.formatMessage({
          id: `director.project.aspect.${item.value.replace(':', '_')}`,
          defaultMessage: item.label,
        }),
      })),
    [intl]
  );

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await directorApi.listProjects();
      if (res.success) {
        setProjects(res.data || []);
      } else {
        message.error(res.message || '加载失败');
      }
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setCreating(true);
      const res = await directorApi.createProject(values);
      if (res.success) {
        message.success(intl.formatMessage({ id: 'director.project.createSuccess', defaultMessage: '项目创建成功' }));
        setModalOpen(false);
        form.resetFields();
        await loadProjects();
        if (res.data?.id) {
          navigate(`/workspace/create/director/project/${res.data.id}`);
        }
      } else {
        message.error(res.message || '创建失败');
      }
    } catch {
      // validation
    } finally {
      setCreating(false);
    }
  };

  const getAspectLabel = (ratio: string) =>
    aspectLabelMap[ratio] ||
    intl.formatMessage({
      id: `director.project.aspect.${ratio.replace(':', '_')}`,
      defaultMessage: ratio,
    });

  return (
    <div>
      <PageHeader>
        <HeaderMain>
          <PageTitle level={4}>
            <FormattedMessage id="director.list.title" defaultMessage="我的漫剧项目" />
          </PageTitle>
          <PageSubtitle type="secondary">
            <FormattedMessage
              id="director.list.subtitle"
              defaultMessage="从剧本、角色到分镜与图生视频，一站式 AI 漫剧创作"
            />
          </PageSubtitle>
        </HeaderMain>
        <HeaderAction>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            <FormattedMessage id="director.project.create" defaultMessage="新建项目" />
          </Button>
        </HeaderAction>
      </PageHeader>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyWrap>
          <Empty description={intl.formatMessage({ id: 'director.project.empty', defaultMessage: '暂无项目' })}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
              <FormattedMessage id="director.project.createFirst" defaultMessage="创建第一个漫剧项目" />
            </Button>
          </Empty>
        </EmptyWrap>
      ) : (
        <ProjectGrid gutter={[20, 20]}>
          {projects.map((p) => {
            const updatedLabel = formatDateLabel(intl.locale, p.updateTime || p.createTime);
            return (
              <Col xs={24} sm={12} md={8} lg={6} xl={6} key={p.id}>
                <ProjectCard
                  className="project-card"
                  onClick={() => navigate(`/workspace/create/director/project/${p.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/workspace/create/director/project/${p.id}`);
                    }
                  }}
                >
                  <ProjectCover className="project-cover">
                    {p.coverUrl ? (
                      <img alt={p.title} src={p.coverUrl} loading="lazy" />
                    ) : (
                      <CoverPlaceholder>
                        <VideoCameraOutlined />
                      </CoverPlaceholder>
                    )}
                    <ProjectEnterHint className="project-enter-hint">
                      <FormattedMessage id="director.project.open" defaultMessage="进入项目" />
                      <ArrowRightOutlined style={{ fontSize: 11 }} />
                    </ProjectEnterHint>
                    <CoverOverlay>
                      <CoverTitle>{p.title}</CoverTitle>
                      <CoverMetaRow>
                        <CoverTag>{getAspectLabel(p.aspectRatio)}</CoverTag>
                        <CoverTag>
                          {intl.formatMessage(
                            { id: 'director.project.episodeCountTag', defaultMessage: '{count} 集' },
                            { count: p.episodeCount ?? 0 }
                          )}
                        </CoverTag>
                      </CoverMetaRow>
                    </CoverOverlay>
                  </ProjectCover>
                  <ProjectCardBody>
                    {p.stylePrompt ? (
                      <ProjectStyleText type="secondary" ellipsis={{ tooltip: p.stylePrompt }}>
                        {p.stylePrompt}
                      </ProjectStyleText>
                    ) : (
                      <ProjectStyleText type="secondary">
                        <FormattedMessage
                          id="director.project.noStyle"
                          defaultMessage="未设置全局画风"
                        />
                      </ProjectStyleText>
                    )}
                    {updatedLabel ? (
                      <ProjectFooter>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <FormattedMessage
                            id="director.project.updatedAt"
                            defaultMessage="更新于 {time}"
                            values={{ time: updatedLabel }}
                          />
                        </Text>
                      </ProjectFooter>
                    ) : null}
                  </ProjectCardBody>
                </ProjectCard>
              </Col>
            );
          })}
        </ProjectGrid>
      )}

      <Modal
        title={intl.formatMessage({ id: 'director.project.create', defaultMessage: '新建项目' })}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleCreate}
        confirmLoading={creating}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ aspectRatio: '9:16' }}>
          <Form.Item
            name="title"
            label={intl.formatMessage({ id: 'director.project.name', defaultMessage: '项目名称' })}
            rules={[{ required: true, message: intl.formatMessage({ id: 'director.project.nameRequired', defaultMessage: '请输入项目名称' }) }]}
          >
            <Input placeholder={intl.formatMessage({ id: 'director.project.namePlaceholder', defaultMessage: '例如：都市逆袭' })} />
          </Form.Item>
          <Form.Item name="aspectRatio" label={intl.formatMessage({ id: 'director.project.aspectRatio', defaultMessage: '目标画幅' })}>
            <Select options={aspectOptions} />
          </Form.Item>
          <Form.Item name="stylePrompt" label={intl.formatMessage({ id: 'director.project.style', defaultMessage: '全局画风' })}>
            <Input.TextArea rows={2} placeholder="anime style, cinematic lighting" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectList;
