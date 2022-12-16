import Button, {
  ButtonSize,
  ButtonStyleVariant,
} from '../../../../shared/components/layout/Button/Button';
import Divider from '../../../../shared/components/layout/Divider/Divider';
import { useModalStore } from '../../../../shared/hooks/store/useModalStore';
import { useUserProfileStore } from '../../../../shared/hooks/store/useUserProfileStore';

export const UserAuthInfoPassword = () => {
  const user = useUserProfileStore((store) => store.user);
  const editMode = useUserProfileStore((store) => store.editMode);
  const setChangePasswordModal = useModalStore(
    (state) => state.setChangePasswordModal
  );

  if (!editMode) return null;
  return (
    <>
      <section className="password">
        <header>
          <h3>Password settings</h3>
        </header>
        <div className="row">
          <Button
            size={ButtonSize.SMALL}
            styleVariant={ButtonStyleVariant.STANDARD}
            text="Change password"
            onClick={() => {
              if (user) {
                setChangePasswordModal({
                  visible: true,
                  user: user,
                });
              }
            }}
          />
        </div>
      </section>
      <Divider />
    </>
  );
};