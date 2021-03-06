import { StyleSheet } from "react-native";

export default StyleSheet.create({
    list: {
        marginBottom: 30
    },
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ececec'
    },
    itemContent: {
        justifyContent: 'flex-start',
        flexGrow: 1,
        marginLeft: 12
    },
    itemMessage: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    checkImage: {
        width: 24,
        height: 24,
        borderRadius: 12
    },
    itemCaption: {

    },
    itemTime: {
        marginTop: 2,
        fontSize: 10
    },
    emptyContainer: {
        flex:1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyText:{
        fontSize: 20,
        fontWeight: 'bold'
    }
});
