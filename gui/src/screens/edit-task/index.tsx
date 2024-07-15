import React, { useState } from "react"
import { Alert, FlatList, Pressable, TextInput } from "react-native"
import { useTheme } from "@shopify/restyle"
import { isToday, format } from "date-fns"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import useSWR, { useSWRConfig } from "swr"
import useSWRMutation from "swr/mutation"
import { Calendar } from "react-native-calendars"
import { HomeStackParamList } from "../../navigation/types"
import { ICategory, ITask } from "../../types"
import axiosInstance, { fetcher } from "../../services/config"
import { Box, Text, Theme } from "../../utils/theme"
import Loader from "../../components/shared/loader"
import SafeAreaWrapper from "../../components/shared/safe-area-wrapper"
import  Icon  from "react-native-vector-icons/MaterialCommunityIcons"
import NavigateBack from "../../navigation/navigate-back"
import { today } from "../../components/tasks/task-action"


type EditTaskRouteType = RouteProp<HomeStackParamList, "EditTask">

const updateTaskRequest = async (url: string, { arg }: { arg: ITask }) => {
  try {
    await axiosInstance.put(url + "/" + arg._id, {
      ...arg,
    })
  } catch (error) {}
}

const deleteTaskRequest = async (
  url: string,
  { arg }: { arg: { id: string } }
) => {
  try {
    await axiosInstance.delete(url + "/" + arg.id)
  } catch (error) {}
}

const EditTaskScreen = () => {
  const theme = useTheme<Theme>()

  const route = useRoute<EditTaskRouteType>()

  const navigation = useNavigation()

  const { trigger } = useSWRMutation("tasks/editTask", updateTaskRequest)
  const { trigger: triggerDelete } = useSWRMutation("tasks/delete", deleteTaskRequest)

  const { task } = route.params

  const [updatedTask, setUpdatedTask] = useState(task)

  const { mutate } = useSWRConfig()

  const [isSelectingCategory, setIsSelectingCategory] = useState<boolean>(false)
  const [isSelectingDate, setIsSelectingDate] = useState<boolean>(false)

  const { data: categories, isLoading } = useSWR<ICategory[]>(
    "categories",
    fetcher
  )

  const deleteTask = async () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa công việc này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              await triggerDelete({
                id: task._id,
              })
              await mutate("tasks/")
              navigation.goBack()
            } catch (error) {
              console.log("error in deleteTask", error)
              throw error
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  }

  const updateTask = async () => {
    try {
      if (updateTask.name.length.toString().trim().length > 0) {
        await trigger({ ...updatedTask })
        await mutate("tasks/")
        navigation.goBack()
      }
    } catch (error) {
      console.log("error in updateTask", error)
      throw error
    }
  }

  if (isLoading || !categories) {
    return <Loader />
  }

  const selectedCategory = categories?.find(
    (_category) => _category._id === updatedTask.categoryId
  )

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <SafeAreaWrapper>
      <Box flex={1} mx="4">
        <Box
          flexDirection="row"
          top={15}
        >
          <NavigateBack />
          <Pressable onPress={deleteTask} style={{right: -310}}>
            <Icon
              name="delete"
              size={24}
              color={theme.colors.rose500}
            />
          </Pressable>
          <Pressable onPress={updateTask} style={{right: -250}}>
            <Icon
              name="check"
              size={24}
              color={theme.colors.green900}
            />
          </Pressable>
        </Box>

        <Box height={20} />

        <Box
          bg="fuchsia100"
          px="4"
          py="3.5"
          borderRadius="rounded-5xl"
          flexDirection="row"
          position="relative"
        >
          <TextInput
            placeholder="Create a new task"
            style={{
              paddingVertical: 8,
              paddingHorizontal: 8,
              fontSize: 16,
              width: "50%",
            }}
            maxLength={36}
            textAlignVertical="center"
            value={updatedTask.name}
            onChangeText={(text) => {
              setUpdatedTask((prev) => {
                return {
                  ...prev,
                  name: text,
                }
              })
            }}
          />
          <Box flexDirection="row" alignItems="center">
            <Pressable
              onPress={() => {
                setIsSelectingDate((prev) => !prev)
              }}
            >
              <Box
                flexDirection="row"
                alignContent="center"
                bg="white"
                p="2"
                borderRadius="rounded-xl"
              >
                <Text>
                  {isToday(new Date(updatedTask.date))
                    ? "Today"
                    : format(new Date(updatedTask.date), "MMM dd")}
                </Text>
              </Box>
            </Pressable>
            <Box width={12} />
            <Pressable
              onPress={() => {
                setIsSelectingCategory((prev) => !prev)
              }}
            >
              <Box
                bg="white"
                flexDirection="row"
                alignItems="center"
                p="2"
                borderRadius="rounded-xl"
              >
                <Box
                  width={12}
                  height={12}
                  borderRadius="rounded"
                  borderWidth={2}
                  mr="1"
                  style={{
                    borderColor: selectedCategory?.color.code,
                  }}
                ></Box>
                <Text
                  style={{
                    color: selectedCategory?.color.code,
                  }}
                >
                  {truncateText(selectedCategory?.name || "Categories", 8)}
                 
                </Text>
              </Box>
            </Pressable>
          </Box>
        </Box>

        {isSelectingCategory && (
          <Box alignItems="flex-end" my="4" justifyContent="flex-end" >
            <FlatList
              data={categories}
              renderItem={({ item, index }) => {
                return (
                  <Pressable
                    onPress={() => {
                      setUpdatedTask((prev) => {
                        return {
                          ...prev,
                          categoryId: item._id,
                        }
                      })
                      setIsSelectingCategory(false)
                    }}
                  >
                    <Box
                      bg="gray250"
                      p="2"
                      borderTopStartRadius={
                        index === 0 ? "rounded-3xl" : "none"
                      }
                      borderTopEndRadius={index === 0 ? "rounded-3xl" : "none"}
                      borderBottomStartRadius={
                        categories?.length - 1 === index
                          ? "rounded-2xl"
                          : "none"
                      }
                      borderBottomEndRadius={
                        categories?.length - 1 === index
                          ? "rounded-2xl"
                          : "none"
                      }
                    >
                      <Box flexDirection="row">
                        <Text>{item.icon.symbol}</Text>
                        <Text
                          ml="2"
                          fontWeight={
                            updatedTask.categoryId === item._id ? "700" : "400"
                          }
                        >
                          {truncateText(item.name,8)}
                        </Text>
                      </Box>
                    </Box>
                  </Pressable>
                )
              }}
            />
          </Box>
        )}
        {isSelectingDate && (
          <Box>
            <Calendar
              minDate={format(today, "y-MM-dd")}
              onDayPress={(day: { dateString: string | number | Date }) => {
                setIsSelectingDate(false)
                const selectedDate = new Date(day.dateString).toISOString()
                setUpdatedTask((prev) => {
                  return {
                    ...prev,
                    date: selectedDate,
                  }
                })
              }}
            />
          </Box>
        )}
      </Box>
    </SafeAreaWrapper>
  )
}

export default EditTaskScreen