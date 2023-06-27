import { ActionArgs, LoaderArgs, redirect } from '@remix-run/node'
import { Form, useNavigation } from '@remix-run/react'
import { prisma } from '~/db.server'
import { getUser } from '~/utils/auth'

export const loader = async (args: LoaderArgs) => {
  await getUser(args)
  return {}
}
export const action = async (args: ActionArgs) => {
  const { userId } = await getUser(args)
  const formData = await args.request.formData()
  const { name, colour } = Object.fromEntries(formData)

  await prisma.habit.create({
    data: {
      name: name.toString()!,
      colour: colour.toString()!,
      userId,
      days: formData.getAll('days').map((d) => String(d))
    }
  })

  throw redirect('/habits')
}

export default function NewHabit() {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const isLoading = navigation.state === 'loading'
  return (
    <div className='max-w-md mx-auto'>
      <Form method='post'>
        <div className='flex gap-2'>
          <div className='flex-1'>
            <label htmlFor='name'>Name</label>
            <input
              className='block w-full p-2 border border-gray-400'
              type='text'
              name='name'
              id='name'
              placeholder='name'
              autoComplete='off'
              minLength={3}
              maxLength={255}
              required
            />
          </div>
          <div className='flex-1'>
            <label htmlFor='colour'>Colour</label>
            <input
              className='block w-full rounded-none border-none bg-none'
              type='color'
              name='colour'
              id='colour'
              required
            />
          </div>
        </div>
        <span className='text-lg font-bold mt-4 mb-2 block'>Days</span>
        <div className='flex gap-4 justify-center items-center my-4'>
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
              className='h-8 w-8 flex justify-center items-center rounded-full relative text-center transition select-none z-[2] toggle-label border-2 text-sky-500 border-sky-500'>
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
