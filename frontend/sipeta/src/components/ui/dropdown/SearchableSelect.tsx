import { useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

interface SearchableSelectProps {
    items: { id: string | number; name: string; type?: string; metadata?: any }[]; // Expanded interface
    placeholder?: string;
    onSelect: (item: any) => void;
    label?: string;
    loading?: boolean;
}

export default function SearchableSelect({ items, placeholder, onSelect, label, loading }: SearchableSelectProps) {
    const [selected, setSelected] = useState<any>(null);
    const [query, setQuery] = useState('');

    const filteredItems =
        query === ''
            ? items
            : items.filter((item) => {
                const searchTarget = (item as any).searchName || item.name;
                return searchTarget
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(query.toLowerCase().replace(/\s+/g, ''));
            });

    const handleSelect = (item: any) => {
        setSelected(item); // Keep it selected or clear it? Usually navigate implies we don't need to persist explicitly, but it looks nice.
        onSelect(item);
    };

    return (
        <div className="">
            {label && <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">{label}</label>}
            <Combobox value={selected} onChange={handleSelect}>
                <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left border-2 border-gray-200 dark:border-gray-700 shadow-sm focus-within:border-[#0052CC] focus-within:ring-4 focus-within:ring-[#0052CC]/10 transition-all sm:text-sm hover:border-[#0052CC]">
                        <Combobox.Input
                            className="w-full border-none py-3 pl-10 pr-10 text-base leading-5 text-gray-900 dark:text-white bg-transparent outline-none font-medium placeholder-gray-400"
                            displayValue={(item: any) => item?.name || ''}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={placeholder} // Placeholder behaves differently in Combobox if value is set.
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </Combobox.Button>
                        {loading && (
                            <div className="absolute inset-y-0 right-8 flex items-center">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                            </div>
                        )}
                    </div>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                    >
                        <Combobox.Options className="absolute mt-2 max-h-[400px] w-full overflow-auto rounded-2xl bg-white dark:bg-gray-800 py-2 text-base shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-base z-50 scroller-thin">
                            {/* Empty State */}
                            {filteredItems.length === 0 && query !== '' ? (
                                <div className="relative cursor-default select-none py-4 px-6 text-gray-700 dark:text-gray-400">
                                    Tidak ditemukan.
                                </div>
                            ) : (
                                filteredItems.slice(0, 100).map((item, idx) => ( // Limit rendering for perf
                                    <Combobox.Option
                                        key={item.id ?? idx}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-3.5 pl-6 pr-4 text-base ${active ? 'bg-[#0052CC]/10 text-[#0052CC]' : 'text-gray-900 dark:text-gray-200'
                                            }`
                                        }
                                        value={item}
                                    >
                                        {({ selected, active }) => (
                                            <>
                                                <span
                                                    className={`block truncate ${selected ? 'font-black' : 'font-normal'
                                                        }`}
                                                >
                                                    {item.name}
                                                    {item.metadata?.parent && (
                                                        <span className="ml-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                                                            {item.metadata.parent}
                                                        </span>
                                                    )}
                                                </span>
                                                {selected || active ? (
                                                    <span
                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-[#0052CC]' : 'text-[#0052CC]'
                                                            }`}
                                                    >
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Combobox.Option>
                                ))
                            )}
                        </Combobox.Options>
                    </Transition>
                </div>
            </Combobox>
        </div>
    );
}
