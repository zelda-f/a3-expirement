import {
  AppShell, Container, LoadingOverlay, Tabs,
} from '@mantine/core';
import { useParams } from 'react-router-dom';
import {
  IconMessageCircle, IconPhoto, IconSettings, IconTable,
} from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import AppHeader from './components/interface/AppHeader';
import { GlobalConfig, ParticipantData } from '../parser/types';
import { SummaryBlock } from './dashboard/SummaryBlock';
import { StatsBoard } from './stats/StatsBoard';
import { FirebaseStorageEngine } from '../storage/engines/FirebaseStorageEngine';
import { getStudyConfig } from '../utils/fetchConfig';
import { isStudyCompleted } from './utils';

export function AnalysisInterface(props: { globalConfig: GlobalConfig; }) {
  const { globalConfig } = props;
  const { studyId } = useParams();
  const [expData, setExpData] = useState<ParticipantData[]>([]);
  const [completed, setCompleted] = useState<ParticipantData[]>([]);
  const [inprogress, setInprogress] = useState<ParticipantData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      // reSetSelection();
      const fetchData = async () => {
        if (studyId) {
          const storageEngine = new FirebaseStorageEngine();
          const cf = await getStudyConfig(studyId, globalConfig);
          if (!cf || !storageEngine) return;
          await storageEngine.connect();
          await storageEngine.initializeStudyDb(studyId, cf);
          const data = (await storageEngine.getAllParticipantsData());
          setExpData(data);
          setCompleted(data.filter((d) => isStudyCompleted(d)));

          setInprogress(data.filter((d) => !isStudyCompleted(d)));
        }
        setLoading(false);
      };
      await fetchData();
    };
    getData();
  }, [studyId]);

  return (
    <AppShell>
      <AppHeader studyIds={props.globalConfig.configsList} selectedId={studyId} />
      <Container fluid>
        <LoadingOverlay visible={loading} zIndex={1000} overlayBlur={2} />
        <Tabs mt={0} defaultValue="gallery">
          <Tabs.List>
            <Tabs.Tab value="Table View" icon={<IconTable size={14} />}>Table View</Tabs.Tab>
            <Tabs.Tab value="messages" icon={<IconMessageCircle size={14} />}>Messages</Tabs.Tab>
            <Tabs.Tab value="settings" icon={<IconSettings size={14} />}>Settings</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="gallery" pt="xs">
            Gallery tab content
          </Tabs.Panel>

          <Tabs.Panel value="messages" pt="xs">
            Messages tab content
          </Tabs.Panel>

          <Tabs.Panel value="settings" pt="xs">
            Settings tab content
          </Tabs.Panel>
        </Tabs>
        {/* <StatsBoard globalConfig={props.globalConfig}  completed={completed} inprogress={inprogress}/> */}
      </Container>
    </AppShell>
  );
}
