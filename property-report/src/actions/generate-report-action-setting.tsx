/** @jsx jsx */
import { React, jsx, css } from 'jimu-core'
import type { ActionSettingProps } from 'jimu-core'
import { Switch, TextInput } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'

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
                    When triggered, the Property Report widget will automatically run a
                    report at the selected location.
                </div>

                <SettingRow label="Auto-scroll to results" flow="no-wrap">
                    <Switch
                        checked={config.autoScrollToResults !== false}
                        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                            update({ autoScrollToResults: evt.target.checked })
                        }}
                        aria-label="Auto-scroll to results"
                    />
                </SettingRow>

                <SettingRow label="Auto-open section (optional)" flow="wrap">
                    <TextInput
                        size="sm"
                        value={config.autoOpenSection ?? ''}
                        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                            update({ autoOpenSection: evt.target.value || undefined })
                        }}
                        placeholder="Leave blank for default behavior"
                        aria-label="Section ID to auto-open"
                    />
                </SettingRow>
            </div>
        </div>
    )
}

export default GenerateReportActionSetting