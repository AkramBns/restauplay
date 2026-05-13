import { LegendList, LegendListRef, LegendListRenderItemProps } from "@legendapp/list";
import React, { useRef } from "react";
import { Image, Text, View } from "react-native";

// Define the type for your data items
interface UserData {
    id: string;
    name: string;
    photoUri: string;
}

const LegendListExample = () => {
    // Optional: Ref for accessing list methods (e.g., scrollTo)
    const listRef = useRef<LegendListRef | null>(null)

    const data = [
            { id: "1", name: "Item 1" , photoUri: "https://example.com/photo1.jpg" },
            { id: "2", name: "Item 2" , photoUri: "https://example.com/photo2.jpg" },
            { id: "3", name: "Item 3" , photoUri: "https://example.com/photo3.jpg" },
        ];

    const renderItem = ({ item }: LegendListRenderItemProps<UserData>) => {
        return (
            <View>
                <Image source={{ uri: item.photoUri }} />
                <Text>{item.name}</Text>
            </View>
        )
    }

    return (
        <LegendList
            // Required Props
            data={data}
            renderItem={renderItem}

            // Recommended props (Improves performance)
            keyExtractor={(item) => item.id}
            recycleItems={true}

            // Recommended if data can change
            maintainVisibleContentPosition

            ref={listRef}
            style={{ flex: 1 }}
        />
    )
}

export default LegendListExample
