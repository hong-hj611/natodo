<Modal 
  visible={!!editTodo} 
  animationType="slide"
  transparent={true}
>
  <View style={styles.modalWrap}>
    <View style={styles.modalBox}>
      
      <Text style={styles.modalTitle}>할 일 수정</Text>

      <TextInput
        style={styles.input}
        value={editTodo?.title}
        onChangeText={(text) =>
          setEditTodo({...editTodo, title: text})
        }
      />

      <TextInput
        style={styles.input}
        value={editTodo?.date}
        onChangeText={(text) =>
          setEditTodo({...editTodo, date: text})
        }
      />

      {/* 이미지 변경 버튼도 가능 */}
      {/* 나중에 원하면 추가해줄게 */}

      <View style={styles.row}>
        <Pressable 
          style={styles.cancelBtn}
          onPress={() => setEditTodo(null)}
        >
          <Text>취소</Text>
        </Pressable>

        <Pressable 
          style={styles.saveBtn}
          onPress={saveEditedTodo}
        >
          <Text>저장</Text>
        </Pressable>
      </View>

    </View>
  </View>
</Modal>
