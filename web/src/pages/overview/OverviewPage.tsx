import './style.scss';

import { useQuery } from '@tanstack/react-query';
import { isUndefined, orderBy } from 'lodash-es';
import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useBreakpoint } from 'use-breakpoint';

import { useI18nContext } from '../../i18n/i18n-react';
import { PageContainer } from '../../shared/components/Layout/PageContainer/PageContainer';
import { NetworkGatewaysStatus } from '../../shared/components/network/GatewaysStatus/NetworkGatewaysStatus/NetworkGatewaysStatus';
import { deviceBreakpoints } from '../../shared/constants';
import { LoaderSpinner } from '../../shared/defguard-ui/components/Layout/LoaderSpinner/LoaderSpinner';
import { NoData } from '../../shared/defguard-ui/components/Layout/NoData/NoData';
import useApi from '../../shared/hooks/useApi';
import { QueryKeys } from '../../shared/queries';
import { OverviewLayoutType } from '../../shared/types';
import { sortByDate } from '../../shared/utils/sortByDate';
import { useOverviewTimeSelection } from '../overview-index/components/hooks/useOverviewTimeSelection';
import { useWizardStore } from '../wizard/hooks/useWizardStore';
import { useOverviewStore } from './hooks/store/useOverviewStore';
import { OverviewConnectedUsers } from './OverviewConnectedUsers/OverviewConnectedUsers';
import { StandaloneDeviceConnectionCard } from './OverviewConnectedUsers/UserConnectionCard/UserConnectionCard';
import { OverviewExpandable } from './OverviewExpandable/OverviewExpandable';
import { OverviewHeader } from './OverviewHeader/OverviewHeader';
import { OverviewStats } from './OverviewStats/OverviewStats';

const STATUS_REFETCH_TIMEOUT = 30 * 1000;

export const OverviewPage = () => {
  const navigate = useNavigate();
  const { breakpoint } = useBreakpoint(deviceBreakpoints);
  const setOverViewStore = useOverviewStore((state) => state.setState);
  const resetWizard = useWizardStore((state) => state.resetState);
  const viewMode = useOverviewStore((state) => state.viewMode);
  const { LL } = useI18nContext();
  const { from: statsFilter } = useOverviewTimeSelection();
  const { networkId } = useParams();
  const selectedNetworkId = parseInt(networkId ?? '');
  const location = useLocation();

  const {
    network: { getNetworks, getOverviewStats, getNetworkStats },
  } = useApi();

  const { data: fetchNetworksData } = useQuery({
    queryKey: ['network'],
    queryFn: getNetworks,
    placeholderData: (perv) => perv,
  });

  const { data: networkStats } = useQuery({
    queryKey: [QueryKeys.FETCH_NETWORK_STATS, statsFilter, selectedNetworkId],
    queryFn: () =>
      getNetworkStats({
        from: statsFilter,
        id: selectedNetworkId,
      }),
    refetchOnWindowFocus: false,
    refetchInterval: STATUS_REFETCH_TIMEOUT,
    enabled: !isUndefined(selectedNetworkId) && !isNaN(selectedNetworkId),
  });

  const { data: overviewStats, isLoading: userStatsLoading } = useQuery({
    queryKey: [QueryKeys.FETCH_NETWORK_USERS_STATS, statsFilter, selectedNetworkId],
    queryFn: () =>
      getOverviewStats({
        from: statsFilter,
        id: selectedNetworkId,
      }),
    enabled:
      !isUndefined(statsFilter) &&
      !isUndefined(selectedNetworkId) &&
      !isNaN(selectedNetworkId),
    refetchOnWindowFocus: false,
    refetchInterval: STATUS_REFETCH_TIMEOUT,
  });

  const getNetworkUsers = useMemo(() => {
    if (overviewStats !== undefined) {
      const user = sortByDate(overviewStats.user_devices, (s) => {
        const fistDevice = sortByDate(s.devices, (d) => d.connected_at, false)[0];
        return fistDevice.connected_at;
      });
      const devices = sortByDate(
        overviewStats.network_devices.filter((d) => d.connected_at !== undefined),
        (d) => d.connected_at as string,
      );
      return {
        network_devices: devices,
        user_devices: user,
      };
    }
    return undefined;
  }, [overviewStats]);

  // FIXME: lock viewMode on grid for now
  useEffect(() => {
    if (viewMode !== OverviewLayoutType.GRID) {
      setOverViewStore({ viewMode: OverviewLayoutType.GRID });
    }
  }, [setOverViewStore, viewMode]);

  useEffect(() => {
    if (isNaN(selectedNetworkId)) {
      navigate(`/admin/overview/${location.search}`, {
        replace: true,
      });
    }
    if (fetchNetworksData) {
      if (!fetchNetworksData.length) {
        resetWizard();
        navigate('/admin/wizard', { replace: true });
      } else {
        setOverViewStore({ networks: fetchNetworksData });
        const ids = fetchNetworksData.map((n) => n.id);
        if (
          isUndefined(selectedNetworkId) ||
          (!isUndefined(selectedNetworkId) && !ids.includes(selectedNetworkId))
        ) {
          const oldestNetwork = orderBy(fetchNetworksData, ['id'], ['asc'])[0];
          setOverViewStore({ selectedNetworkId: oldestNetwork.id });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchNetworksData, selectedNetworkId]);

  return (
    <>
      <PageContainer id="network-overview-page">
        <OverviewHeader />
        {breakpoint === 'desktop' && !isUndefined(selectedNetworkId) && (
          <NetworkGatewaysStatus networkId={selectedNetworkId} />
        )}
        {networkStats && <OverviewStats networkStats={networkStats} />}
        <div className="bottom-row">
          {userStatsLoading && (
            <div className="stats-loader">
              <LoaderSpinner size={180} />
            </div>
          )}
          {!getNetworkUsers && !userStatsLoading && <NoData />}
          {!userStatsLoading &&
            getNetworkUsers &&
            getNetworkUsers.network_devices.length === 0 &&
            getNetworkUsers.user_devices.length === 0 && <NoData />}
          {!userStatsLoading &&
            getNetworkUsers &&
            getNetworkUsers.user_devices.length > 0 && (
              <OverviewExpandable title={LL.networkOverview.cardsLabels.users()}>
                <OverviewConnectedUsers stats={getNetworkUsers.user_devices} />
              </OverviewExpandable>
            )}
          {!userStatsLoading &&
            getNetworkUsers &&
            getNetworkUsers.network_devices.length > 0 && (
              <OverviewExpandable title={LL.networkOverview.cardsLabels.devices()}>
                <div className="connection-cards">
                  <div className="connected-users grid">
                    {getNetworkUsers.network_devices.map((device) => (
                      <StandaloneDeviceConnectionCard data={device} key={device.id} />
                    ))}
                  </div>
                </div>
              </OverviewExpandable>
            )}
        </div>
      </PageContainer>
      {/* Modals */}
    </>
  );
};
