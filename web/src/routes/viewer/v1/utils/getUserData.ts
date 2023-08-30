import _ from 'lodash'
import { getUserData, unknownUser, type userData } from '../../../../utils/usernames'
import demoUserData from '../demo/demo_user_data.json'

export async function getUserDataDemoFallback(userId: string): Promise<userData> {
  if (userId.startsWith('demo-')) {
    return {
      ..._.cloneDeep(unknownUser),
      global_name: demoUserData[userId].name,
      avatar: {
        id: '',
        is_animated: false,
        link: demoUserData[userId].avatar
      }
    }
  } else {
    return getUserData(userId)
  }
}