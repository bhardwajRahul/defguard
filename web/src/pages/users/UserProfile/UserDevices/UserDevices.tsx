import './style.scss';

import Skeleton from 'react-loading-skeleton';
import { useNavigate } from 'react-router';

import { useI18nContext } from '../../../../i18n/i18n-react';
import { useAppStore } from '../../../../shared/hooks/store/useAppStore';
import { useAuthStore } from '../../../../shared/hooks/store/useAuthStore';
import { useUserProfileStore } from '../../../../shared/hooks/store/useUserProfileStore';
import { useAddDevicePageStore } from '../../../addDevice/hooks/useAddDevicePageStore';
import { AddComponentBox } from '../../shared/components/AddComponentBox/AddComponentBox';
import { DeviceCard } from './DeviceCard/DeviceCard';
import { DeleteUserDeviceModal } from './modals/DeleteUserDeviceModal/DeleteUserDeviceModal';
import { DeviceConfigModal } from './modals/DeviceConfigModal/DeviceConfigModal';
import { EditUserDeviceModal } from './modals/EditUserDeviceModal/EditUserDeviceModal';

export const UserDevices = () => {
  const navigate = useNavigate();
  const appInfo = useAppStore((state) => state.appInfo);
  const settings = useAppStore((state) => state.enterprise_settings);
  const { LL } = useI18nContext();
  const userProfile = useUserProfileStore((state) => state.userProfile);
  const initAddDevice = useAddDevicePageStore((state) => state.init);
  const isAdmin = useAuthStore((state) => state.user?.is_admin);
  const canManageDevices = !!(
    userProfile &&
    (!settings?.admin_device_management || isAdmin)
  );

  return (
    <section id="user-devices">
      <header>
        <h2>{LL.userPage.devices.header()}</h2>
      </header>
      {!userProfile && (
        <div className="skeletons">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      )}
      {userProfile && (
        <>
          {userProfile.devices && userProfile.devices.length > 0 && (
            <div className="devices">
              {userProfile.devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  modifiable={canManageDevices}
                />
              ))}
            </div>
          )}
          {userProfile && (
            <AddComponentBox
              data-testid="add-device"
              text={LL.userPage.devices.addDevice.web()}
              disabled={!appInfo?.network_present || !canManageDevices}
              callback={() => {
                initAddDevice({
                  username: userProfile.user.username,
                  id: userProfile.user.id,
                  reservedDevices: userProfile.devices.map((d) => d.name),
                  email: userProfile.user.email,
                  originRoutePath: window.location.pathname,
                });
                navigate('/add-device', { replace: true });
              }}
            />
          )}
        </>
      )}
      <DeleteUserDeviceModal />
      <EditUserDeviceModal />
      <DeviceConfigModal />
    </section>
  );
};
