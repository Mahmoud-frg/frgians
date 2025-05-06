import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Logo from '@/components/Logo'
import GoBackBtn from '@/components/GoBackBtn'

const DelePerson = () => {
  return (
<View className='bg-primary flex-1'>
      {/* Logo */}
      <View className='flex flex-row mx-5 justify-between items-center'>
        <Text
          className='color-title text-3xl'
          style={{ fontFamily: 'outfit-bold' }}
        >
          Delete Person
        </Text>
        <Logo />
      </View>
      <Text
        className='text-lg color-slate-600 ml-5 mb-3'
        style={{ fontFamily: 'outfit-medium' }}
      >
        Fill all details to add a new person
      </Text>

      {/* Information (details) about a person */}
      <ScrollView className='mb-28 bg-slate-100 rounded-3xl'>
        
      </ScrollView>

      {/* Go back button */}
      <GoBackBtn />
    </View>
  )
}

export default DelePerson

const styles = StyleSheet.create({})