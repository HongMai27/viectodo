import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "@shopify/restyle";
import CategoriesStackNavigator from "./categories-stack-navigator";
import HomeStackNavigator from "./home-stack-navigator";
import { RootBottomTabParamList } from "./types";
import CompletedScreen from "../screens/completed-screen";
import TodayScreen from "../screens/today-screen";
import { StyleSheet, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import TaskCalendarScreen from "../screens/task-calendar-screen";

const Tab = createBottomTabNavigator<RootBottomTabParamList>();


interface CustomTabBarIconProps {
  name: string;
  color: string;
}


const CustomTabBarIcon = ({ name, color }: CustomTabBarIconProps) => (
  <Icon name={name} size={24} color={color} />
);

const BottomTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.colors.purple1000,
        tabBarInactiveTintColor: theme.colors.gray400,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color }) => {
          let iconName;

          switch (route.name) {
            case 'HomeStack':
              iconName = 'home';
              break;
            case 'Completed':
              iconName = 'check-circle-outline';
              break;
            case 'Today':
              iconName = 'calendar-today';
              break;
            case 'CategoriesStack':
              iconName = 'format-list-bulleted';
              break;
            case 'Settings':
              iconName = 'calendar-month';
              break;
            default:
              iconName = 'help-circle';
          }

          return <CustomTabBarIcon name={iconName} color={color} />;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{ title: "Trang chủ" }}
      />
      <Tab.Screen
        name="Completed"
        component={CompletedScreen}
        options={{ title: "Lịch sử" }}
      />
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{ title: "Hôm nay" }}
      />
      <Tab.Screen
        name="CategoriesStack"
        component={CategoriesStackNavigator}
        options={{ title: "Danh mục" }}
      />
      <Tab.Screen
        name="Settings"
        component={TaskCalendarScreen}
        options={{ title: "Lịch" }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default BottomTabNavigator;