// import * as Icons from "@heroicons/react/24/outline"
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect
} from '@remix-run/node'
import { Form, useNavigation } from '@remix-run/react'
import randomColour from 'randomcolor'
import { useState } from 'react'
import Button from '~/components/Button'
import Checkbox from '~/components/Form/Checkbox'
import Input, { Textarea } from '~/components/Input'
import { prisma } from '~/db.server'
import { getUser } from '~/utils/auth.server'

export const loader = async (args: LoaderFunctionArgs) => {
  await getUser(args)
  return {}
}
export const action = async (args: ActionFunctionArgs) => {
  const { userId } = await getUser(args)
  const formData = await args.request.formData()
  const { name, colour, description, privateHabit } =
    Object.fromEntries(formData)

  await prisma.habit.create({
    data: {
      name: name.toString()!,
      colour: colour.toString()!,
      private: !!privateHabit,
      userId,
      days: formData.getAll('days').map((d) => String(d)),
      description: description.toString()
    }
  })

  throw redirect('/habits')
  return {}
}

export const meta: MetaFunction = () => {
  return [{ title: `Sorted | New Habit` }]
}

export default function NewHabit() {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const isLoading = navigation.state === 'loading'
  const [colour, setColour] = useState(randomColour())
  // const icons = Object.entries(Icons)

  return (
    <div className='max-w-md mx-auto'>
      <Form method='post'>
        <div className='flex gap-2 mb-4'>
          <Input
            label='Name'
            type='text'
            name='name'
            id='name'
            placeholder='e.g Drink 2L'
            autoComplete='off'
            minLength={3}
            maxLength={255}
            required
          />
          <div className='flex'>
            <Input
              label='Colour'
              className='p-0 border-none'
              type='color'
              name='colour'
              value={colour}
              onChange={(e) => {
                setColour(e.target.value)
              }}
              id='colour'
              required
            />
            <Button
              className='self-end'
              onClick={() => {
                setColour(randomColour())
              }}
              variant='ghost'
              type='button'>
              <ArrowPathIcon className='h-6 w-6 dark:text-gray-50' />
            </Button>
          </div>
        </div>
        <Textarea
          label='Description'
          name='description'
          placeholder='Give your habit a nice description...'
          id='description'
          autoComplete='off'
        />
        <Checkbox className='mt-4' name='privateHabit' label='Private Habit' />
        <span className='text-sm text-center text-gray-400 mt-4 mb-2 block'>
          Select the days you'd like to track:
        </span>
        <div className='grid grid-cols-7 gap-1 md:gap-3 justify-items-center my-4'>
          {[
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
          ].map((d, i) => (
            <label
              htmlFor={`days-${d}`}
              key={d}
              title={d}
              className='scale-95 min-h-[2rem] h-full w-full aspect-square flex justify-center items-center rounded-full relative text-center transition select-none z-[2] toggle-label border-2 text-sky-500 border-sky-500'>
              {d.substring(0, 1)}
              <input
                type='checkbox'
                name='days'
                id={`days-${d}`}
                value={d}
                className='appearance-none cursor-pointer absolute inset-0 rounded-full toggle-checkbox z-[1]'
              />
            </label>
          ))}
        </div>
        {/* 
        TODO: Allow users to select an icon or randomise them
        <div className="grid grid-cols-6 gap-4">
          {icons.map(([name, Component]) => (
            <div
              className="flex flex-col gap-2 justify-center items-center"
              key={name}
              title={name}>
              <Component className="h-6 w-6" />
              <span>{name}</span>
            </div>
          ))}
        </div> */}
        <button
          type='submit'
          className='px-4 py-2 bg-indigo-400 text-gray-100 font-semibold tracking-wide rounded shadow active:scale-95 active:opacity-80 disabled:opacity-80 disabled:cursor-not-allowed transition'
          disabled={isSubmitting || isLoading}>
          Create
        </button>
      </Form>
    </div>
  )
}
