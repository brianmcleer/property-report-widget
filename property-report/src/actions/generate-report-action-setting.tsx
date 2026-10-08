/** @jsx jsx */
import { React, jsx, css } from 'jimu-core'
import type { ActionSettingProps } from 'jimu-core'
import { Switch, TextInput } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { hooks as __exbI18nHooks } from 'jimu-core';
import __exbI18nMessages from '../runtime/translations/default';


interface ActionConfig {
    autoOpenSection?: string
    autoScrollToResults?: boolean
}

const styles = css`
  .action-setting-container {
    padding: 12px;
  }
  .setting-description {
    color: #666;
    font-size: 12px;
    margin-bottom: 12px;
    line-height: 1.4;
  }
`

const GenerateReportActionSetting = (props: ActionSettingProps<ActionConfig>) => {
  const t = __exbI18nHooks.useTranslation(__exbI18nMessages);
    const config: ActionConfig = (props.config as any) ?? { autoScrollToResults: true }

    const update = (patch: Partial<ActionConfig>) => {
        props.onSettingChange({
            actionId: props.actionId,
            config: { ...config, ...patch }
        })
    }

    return (
        <div css={styles}>
            <div className="action-setting-container">
                <div className="setting-description">
                    {t('whenTriggeredThePropertyReportWidget')}
                </div>

                <SettingRow label={t('autoScrollToResults')} flow="no-wrap">
                    <Switch
                        checked={config.autoScrollToResults !== false}
                        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                            update({ autoScrollToResults: evt.target.checked })
                        }}
                        aria-label={t('autoScrollToResults')}
                    />
                </SettingRow>

                <SettingRow label={t('autoOpenSectionOptional')} flow="wrap">
                    <TextInput
                        size="sm"
                        value={config.autoOpenSection ?? ''}
                        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                            update({ autoOpenSection: evt.target.value || undefined })
                        }}
                        placeholder={t('leaveBlankForDefaultBehavior')}
                        aria-label={t('sectionIdToAutoOpen')}
                    />
                </SettingRow>
            </div>
        </div>
    )
}

export default GenerateReportActionSetting