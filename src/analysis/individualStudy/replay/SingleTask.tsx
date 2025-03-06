/* eslint-disable no-nested-ternary */
import { useState } from 'react';
import { Center, Group, Text } from '@mantine/core';
import * as d3 from 'd3';

import { useResizeObserver } from '@mantine/hooks';
import { IconCheck, IconX } from '@tabler/icons-react';
import { StoredAnswer } from '../../../store/types';

const LABEL_MARGIN = 3;
const TIMELINE_HEIGHT = 25;
const LABEL_DISTANCE = 25;
const LABEL_HEIGHT = 20;
const TASK_GAP = 1;
const HAS_CORRECT_MARGIN = 15;

export function SingleTask({
  xScale, answer, name, height, setSelectedTask, isSelected, labelHeight = 0, isCorrect, hasCorrect,
} : {answer: StoredAnswer, name: string, height: number, xScale: d3.ScaleLinear<number, number>, setSelectedTask: (task: string) => void, isSelected: boolean, labelHeight?: number, isCorrect: boolean, hasCorrect: boolean}) {
  const [isHover, setIsHover] = useState(false);

  const [ref, { width: labelWidth }] = useResizeObserver();

  return (
    <g onClick={() => setSelectedTask(name)} onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)} style={{ cursor: 'pointer' }}>
      <rect opacity={1} fill={isHover || isSelected ? 'cornflowerblue' : 'lightgray'} x={xScale(answer.startTime) + TASK_GAP} width={xScale(answer.endTime) - xScale(answer.startTime) - TASK_GAP * 2} y={height - TIMELINE_HEIGHT} height={TIMELINE_HEIGHT} />
      <rect rx={3} opacity={1} x={xScale(answer.startTime) - LABEL_MARGIN} width={labelWidth + LABEL_MARGIN * 2 + (hasCorrect ? HAS_CORRECT_MARGIN : 0)} y={height - TIMELINE_HEIGHT - LABEL_DISTANCE - labelHeight} height={LABEL_HEIGHT} fill="whitesmoke" />
      <line stroke="black" strokeWidth={1} x1={xScale(answer.startTime) - LABEL_MARGIN} x2={labelWidth + xScale(answer.startTime) + LABEL_MARGIN + (hasCorrect ? HAS_CORRECT_MARGIN : 0)} y1={height - TIMELINE_HEIGHT - LABEL_DISTANCE + LABEL_HEIGHT - labelHeight} y2={height - TIMELINE_HEIGHT - LABEL_DISTANCE + LABEL_HEIGHT - labelHeight} />
      <foreignObject x={xScale(answer.startTime)} width={labelWidth + (hasCorrect ? HAS_CORRECT_MARGIN : 0)} y={height - TIMELINE_HEIGHT - LABEL_DISTANCE - labelHeight} height={LABEL_HEIGHT}>
        <Center style={{ width: 'fit-content' }}>
          <Group wrap="nowrap" gap={2}>
            <Text lineClamp={1} ref={ref} mx={0} style={{ width: 'fit-content', fontWeight: 600 }} size="12px">
              {name}
            </Text>
            {(hasCorrect ? isCorrect ? <IconCheck color="var(--mantine-color-green-6)" style={{ marginTop: 2, strokeWidth: 4 }} size="14" /> : (
              <IconX color="var(--mantine-color-red-6)" style={{ marginTop: 2, strokeWidth: 4 }} size={14} />
            ) : '')}
          </Group>

        </Center>
      </foreignObject>
    </g>
  );
}
