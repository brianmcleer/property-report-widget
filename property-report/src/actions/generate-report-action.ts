/**
 * Generate Report Message Action
 *
 * Allows the Property Report widget to be triggered by other widgets
 * (Search, Map, Near Me, Feature Info, etc.) through the ExB message
 * action framework.
 *
 * When triggered it passes the geometry (point) to the Property Report
 * widget via MutableStoreManager so the widget can run its query.
 */
import {
    AbstractMessageAction,
    MessageType,
    MutableStoreManager,
    getAppStore,
    appActions
} from 'jimu-core'
import type {
    Message,
    MessageDescription,
    DataRecordsSelectionChangeMessage,
    DataRecordSetChangeMessage
} from 'jimu-core'

export default class GenerateReportAction extends AbstractMessageAction {
    filterMessageDescription(messageDescription: MessageDescription): boolean {
        return [
            MessageType.DataRecordsSelectionChange,
            MessageType.DataRecordSetChange,
            MessageType.ExtentChange,
            'LOCATION_CHANGE' as any
        ].includes(messageDescription.messageType)
    }

    filterMessage(_message: Message): boolean {
        return true
    }

    getSettingComponentUri(_messageType: MessageType, _messageWidgetId?: string): string {
        return 'actions/generate-report-action-setting'
    }

    onExecute(message: Message, actionConfig?: any): Promise<boolean> {
        let point: { x: number; y: number; spatialReference?: any } | null = null
        let address: string | null = null
        const autoOpenSection: string | null = actionConfig?.autoOpenSection ?? null

        switch (message.type) {
            case MessageType.DataRecordsSelectionChange: {
                const selMsg = message as DataRecordsSelectionChangeMessage
                if (selMsg.records && selMsg.records.length > 0) {
                    const record = selMsg.records[0] as any
                    const feature = record?.feature ?? record?.data
                    const geometry = feature?.geometry ?? record?.geometry
                    if (geometry) {
                        if (geometry.type === 'point') {
                            point = {
                                x: geometry.x,
                                y: geometry.y,
                                spatialReference: geometry.spatialReference?.toJSON?.() ?? geometry.spatialReference ?? { wkid: 4326 }
                            }
                        } else if (geometry.extent) {
                            const center = geometry.extent.center ?? geometry.extent
                            point = {
                                x: center.x ?? (geometry.extent.xmin + geometry.extent.xmax) / 2,
                                y: center.y ?? (geometry.extent.ymin + geometry.extent.ymax) / 2,
                                spatialReference: geometry.spatialReference?.toJSON?.() ?? geometry.spatialReference ?? { wkid: 4326 }
                            }
                        }
                    }
                    const attrs = feature?.attributes ?? record?.getData?.() ?? {}
                    address = attrs.Match_addr ?? attrs.address ?? attrs.Address ??
                        attrs.StAddr ?? attrs.ShortLabel ?? attrs.PlaceName ?? null
                }
                break
            }

            case MessageType.DataRecordSetChange: {
                const setMsg = message as DataRecordSetChangeMessage
                const records = (setMsg as any).records ?? (setMsg as any).dataRecordSet?.records
                if (records && records.length > 0) {
                    const record = records[0] as any
                    const feature = record?.feature ?? record?.data
                    const geometry = feature?.geometry ?? record?.geometry
                    if (geometry) {
                        if (geometry.type === 'point') {
                            point = {
                                x: geometry.x,
                                y: geometry.y,
                                spatialReference: geometry.spatialReference?.toJSON?.() ?? geometry.spatialReference ?? { wkid: 4326 }
                            }
                        } else if (geometry.extent) {
                            const center = geometry.extent.center ?? geometry.extent
                            point = {
                                x: center.x ?? (geometry.extent.xmin + geometry.extent.xmax) / 2,
                                y: center.y ?? (geometry.extent.ymin + geometry.extent.ymax) / 2,
                                spatialReference: geometry.spatialReference?.toJSON?.() ?? geometry.spatialReference ?? { wkid: 4326 }
                            }
                        }
                    }
                    const attrs = feature?.attributes ?? record?.getData?.() ?? {}
                    address = attrs.Match_addr ?? attrs.address ?? attrs.Address ??
                        attrs.StAddr ?? attrs.ShortLabel ?? attrs.PlaceName ?? null
                }
                break
            }

            default: {
                const anyMsg = message as any
                const loc = anyMsg.location ?? anyMsg.point
                if (loc) {
                    point = {
                        x: loc.x ?? loc.longitude,
                        y: loc.y ?? loc.latitude,
                        spatialReference: loc.spatialReference?.toJSON?.() ?? loc.spatialReference ?? { wkid: 4326 }
                    }
                }
                break
            }
        }

        if (point) {
            MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'actionPoint', {
                point,
                address,
                autoOpenSection,
                timestamp: Date.now()
            })

            getAppStore().dispatch(
                appActions.widgetStatePropChange(this.widgetId, 'actionTriggered', true)
            )

            return Promise.resolve(true)
        }

        console.warn('GenerateReportAction: No valid point geometry found in message', message.type)
        return Promise.resolve(true)
    }
} 
