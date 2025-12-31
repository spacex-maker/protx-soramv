import React, { useState, useMemo } from 'react';
import { Modal, Tabs, Empty } from 'antd';
import { DashboardOutlined, RadarChartOutlined, BarChartOutlined, PieChartOutlined, HeatMapOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { skillCategories } from '../../constants';
import { getPercentageColor } from '../../utils';
import { DashboardModal, ChartContainer } from '../../styles';

export default function SkillsDashboard({ visible, onClose, skills, token }) {
  const [activeTab, setActiveTab] = useState('radar');

  // 准备雷达图数据 - 按分类汇总
  const radarData = useMemo(() => {
    const indicators = [];
    const values = [];
    
    skillCategories.forEach(category => {
      if (skills[category.key] && skills[category.key].length > 0) {
        const avgPercentage = skills[category.key].reduce((sum, skill) => sum + skill.percentage, 0) / skills[category.key].length;
        indicators.push({ name: category.title, max: 100 });
        values.push(Math.round(avgPercentage));
      }
    });

    return { indicators, values };
  }, [skills]);

  // 准备柱状图数据 - 显示所有技能
  const barData = useMemo(() => {
    const allSkills = [];
    skillCategories.forEach(category => {
      if (skills[category.key]) {
        skills[category.key].forEach(skill => {
          allSkills.push({
            name: skill.name,
            value: skill.percentage,
            category: category.title
          });
        });
      }
    });
    // 按熟练度排序
    allSkills.sort((a, b) => b.value - a.value);
    // 只显示前20个
    return allSkills.slice(0, 20);
  }, [skills]);

  // 准备饼图数据 - 按分类汇总
  const pieData = useMemo(() => {
    const categoryData = [];
    skillCategories.forEach(category => {
      if (skills[category.key] && skills[category.key].length > 0) {
        const totalPercentage = skills[category.key].reduce((sum, skill) => sum + skill.percentage, 0);
        const avgPercentage = totalPercentage / skills[category.key].length;
        categoryData.push({
          name: category.title,
          value: Math.round(avgPercentage)
        });
      }
    });
    return categoryData;
  }, [skills]);

  // 准备热力图数据 - 按分类和技能
  const heatmapData = useMemo(() => {
    const data = [];
    const categories = [];
    const allSkillNames = [];
    
    // 先收集所有技能名称
    skillCategories.forEach(category => {
      if (skills[category.key] && skills[category.key].length > 0) {
        skills[category.key].forEach(skill => {
          if (!allSkillNames.includes(skill.name)) {
            allSkillNames.push(skill.name);
          }
        });
      }
    });

    // 构建热力图数据
    skillCategories.forEach((category, catIndex) => {
      if (skills[category.key] && skills[category.key].length > 0) {
        categories.push(category.title);
        skills[category.key].forEach(skill => {
          const skillIndex = allSkillNames.indexOf(skill.name);
          if (skillIndex !== -1) {
            data.push([skillIndex, catIndex, skill.percentage]);
          }
        });
      }
    });

    return { data, categories, skillNames: allSkillNames };
  }, [skills]);

  // 雷达图配置
  const radarOption = {
    title: {
      text: '技能熟练度雷达图',
      left: 'center',
      textStyle: {
        color: token.colorText
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%'
    },
    radar: {
      indicator: radarData.indicators,
      center: ['50%', '55%'],
      radius: '70%',
      name: {
        textStyle: {
          color: token.colorText
        }
      },
      splitArea: {
        areaStyle: {
          color: [
            token.colorBgContainer,
            token.colorBgElevated
          ]
        }
      },
      axisLine: {
        lineStyle: {
          color: token.colorBorder
        }
      },
      splitLine: {
        lineStyle: {
          color: token.colorBorder
        }
      }
    },
    series: [{
      name: '技能熟练度',
      type: 'radar',
      data: [{
        value: radarData.values,
        name: '平均熟练度',
        areaStyle: {
          color: token.colorPrimary + '40'
        },
        lineStyle: {
          color: token.colorPrimary,
          width: 2
        },
        itemStyle: {
          color: token.colorPrimary
        }
      }]
    }]
  };

  // 柱状图配置
  const barOption = {
    title: {
      text: '技能熟练度排行（Top 20）',
      left: 'center',
      textStyle: {
        color: token.colorText
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        const param = params[0];
        return `${param.name}<br/>${param.seriesName}: ${param.value}%`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: barData.map(item => item.name),
      axisLabel: {
        rotate: 45,
        color: token.colorTextSecondary,
        fontSize: 11
      },
      axisLine: {
        lineStyle: {
          color: token.colorBorder
        }
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%',
        color: token.colorTextSecondary
      },
      axisLine: {
        lineStyle: {
          color: token.colorBorder
        }
      },
      splitLine: {
        lineStyle: {
          color: token.colorBorder,
          type: 'dashed'
        }
      }
    },
    series: [{
      name: '熟练度',
      type: 'bar',
      data: barData.map(item => ({
        value: item.value,
        itemStyle: {
          color: getPercentageColor(item.value)
        }
      })),
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',
        color: token.colorText
      }
    }]
  };

  // 饼图配置
  const pieOption = {
    title: {
      text: '技能分类平均熟练度',
      left: 'center',
      textStyle: {
        color: token.colorText
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: token.colorText
      }
    },
    series: [{
      name: '技能分类',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: token.colorBgElevated,
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {c}%',
        color: token.colorText
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      data: pieData.map(item => ({
        ...item,
        itemStyle: {
          color: getPercentageColor(item.value)
        }
      }))
    }]
  };

  // 热力图配置
  const heatmapOption = {
    title: {
      text: '技能熟练度热力图',
      left: 'center',
      textStyle: {
        color: token.colorText
      }
    },
    tooltip: {
      position: 'top',
      formatter: (params) => {
        return `${heatmapData.skillNames[params.data[0]]}<br/>${heatmapData.categories[params.data[1]]}: ${params.data[2]}%`;
      }
    },
    grid: {
      height: '50%',
      top: '15%'
    },
    xAxis: {
      type: 'category',
      data: heatmapData.categories,
      splitArea: {
        show: true
      },
      axisLabel: {
        color: token.colorTextSecondary,
        rotate: 45
      },
      axisLine: {
        lineStyle: {
          color: token.colorBorder
        }
      }
    },
    yAxis: {
      type: 'category',
      data: heatmapData.skillNames,
      splitArea: {
        show: true
      },
      axisLabel: {
        color: token.colorTextSecondary
      },
      axisLine: {
        lineStyle: {
          color: token.colorBorder
        }
      }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#ff7875', '#ffa940', '#52c41a', '#1890ff', '#722ed1']
      },
      textStyle: {
        color: token.colorText
      }
    },
    series: [{
      name: '熟练度',
      type: 'heatmap',
      data: heatmapData.data,
      label: {
        show: true,
        formatter: '{c}%',
        color: token.colorText
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  const hasData = radarData.indicators.length > 0;

  return (
    <DashboardModal
      title={
        <span>
          <DashboardOutlined style={{ marginRight: 8 }} />
          技能看板
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      $token={token}
    >
      {!hasData ? (
        <Empty description="暂无技能数据" />
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'radar',
              label: (
                <span>
                  <RadarChartOutlined />
                  雷达图
                </span>
              ),
              children: (
                <ChartContainer $token={token}>
                  <ReactECharts
                    option={radarOption}
                    style={{ height: '500px', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                  />
                </ChartContainer>
              )
            },
            {
              key: 'bar',
              label: (
                <span>
                  <BarChartOutlined />
                  柱状图
                </span>
              ),
              children: (
                <ChartContainer $token={token}>
                  <ReactECharts
                    option={barOption}
                    style={{ height: '500px', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                  />
                </ChartContainer>
              )
            },
            {
              key: 'pie',
              label: (
                <span>
                  <PieChartOutlined />
                  饼图
                </span>
              ),
              children: (
                <ChartContainer $token={token}>
                  <ReactECharts
                    option={pieOption}
                    style={{ height: '500px', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                  />
                </ChartContainer>
              )
            },
            {
              key: 'heatmap',
              label: (
                <span>
                  <HeatMapOutlined />
                  热力图
                </span>
              ),
              children: (
                <ChartContainer $token={token}>
                  <ReactECharts
                    option={heatmapOption}
                    style={{ height: '500px', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                  />
                </ChartContainer>
              )
            }
          ]}
        />
      )}
    </DashboardModal>
  );
}

