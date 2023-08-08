import { HomeFilled } from "@ant-design/icons";
import { Menu } from "antd";
import {useNavigate} from 'react-router-dom';


export default function AppHeader() {
    const navigate = useNavigate();
    const onMenuClick = (item) => {
        navigate(`/${item.key}`)
    }
    return (
      <div className='appHeader'>
        <Menu 
          mode="horizontal"
          onClick={onMenuClick}
          items={[
            {
                label: <HomeFilled />,
                key: ''
            },
            {
                label: 'Web Apps & Scripts',
                key: 'web-app-and-scripts',
                children: [
                    {
                        label: 'Custom Websites',
                        key: 'custom-websites',
                        children: [
                            {
                                label: 'E-commerce',
                                key: 'e-commerce'
                            },
                            {
                                label: 'Blogs & CRMs',
                                key: 'blogs-and-crms'
                            },
                            {
                                label: 'Games',
                                key: 'games'
                            },
                            {
                                label: 'Email Templates',
                                key: 'email-templates'
                            }
                        ]
                    },
                    {
                        label: 'Landing Pages',
                        key: 'landing-pages'
                    },
                    {
                        label: 'chrome-plugins',
                        key: ''
                    },
                    {
                        label: 'RESTful APIs',
                        key: 'api'
                    }
                ]
            },
            {
                label: 'Mobile Apps',
                key: 'mobile-applications',
                children: [
                    {
                        label: 'Hybrid Apps',
                        key: '',
                        children: [
                            {
                                label: 'React Native',
                                key: 'react-native'
                            },
                            {
                                label: 'Flutter',
                                key: 'hybrid-flutter'
                            },
                            {
                                label: 'Ionic',
                                key: 'hybrid-ionic'
                            }
                        ]
                    },
                    {
                        label: 'Native Apps',
                        key: '1',
                        children: [
                            {
                                label: 'Java',
                                key: 'java'
                            },
                            {
                                label: 'Kotlin',
                                key: 'kotlin'
                            }
                        ]
                    },
                    {
                        label: 'Progressive Web Apps (PWA)',
                        key: ''
                    }
                ]
            },
            {
                label: 'Desktop Applications',
                key: 'desktop-applications',
                children: [
                    {
                        label: 'Electron',
                        key: 'electron'
                    },
                    {
                        label: 'Java',
                        key: 'java'
                    },
                    {
                        label: 'Flutter',
                        key: 'flutter'
                    }
                ]
            },
            {
                label: 'Services',
                key: 'services',
                children: [
                    {
                        label: 'Graphics & Design',
                        key: 'graphics-and-design',
                        children: [
                            {
                                label: 'UX Design(Website & App)',
                                key: 'ux-design'
                            },
                            {
                                label: 'Email Design',
                                key: 'email-design'
                            },
                            {
                                label: 'Resume Design',
                                key: 'resume-design'
                            },
                            {
                                label: 'Background Removal',
                                key: 'ai-services'
                            },
                            {
                                label: 'Landing Page Design',
                                key: 'AI Chatbots'
                            },
                        ]
                    },
                    {
                        label: 'Digital Marketing',
                        key: 'AI Websites',
                        children: [
                            {
                                label: 'Search Engine Optimization (SEO)',
                                key: 'AI Applications'
                            },
                            {
                                label: 'Search Engine Marketing (SEM)',
                                key: 'ChatGPT Applications'
                            },
                            {
                                label: 'E-Commerce SEO',
                                key: 'AI Chatbots'
                            },
                            {
                                label: 'Web Analytics',
                                key: 'aiervices'
                            },
                            {
                                label: 'Email Marketing',
                                key: 'avices'
                            },
                            {
                                label: 'Affiliate Marketing',
                                key: 'ai-'
                            }
                        ]
                    },
                
                    {
                        label: 'Business',
                        key: 'business',
                        children: [
                            {
                                label: 'Game Concept Design',
                                key: 'AI Applications'
                            },
                            {
                                label: 'CRM Websites',
                                key: 'ChatGPT Applications'
                            },
                            {
                                label: 'E-Commerce Management',
                                key: 'AI Websites'
                            },
                            {
                                label: 'Data Visualization',
                                key: 'data-visualization'
                            }
                        ]
                    },
                    {
                        label: 'AI Services',
                        key: 'ai-services',
                        children: [
                            {
                                label: 'AI Applications',
                                key: 'ai-applications'
                            },
                            {
                                label: 'ChatGPT Applications',
                                key: 'chat-gpt-pplications'
                            },
                            {
                                label: 'AI Websites',
                                key: 'ai-websites'
                            },
                            {
                                label: 'AI Chatbots',
                                key: 'ai-chatbots'
                            }
                        ]
                    }
                    
                ]
            },
            {
                label: 'About',
                key: 'accessories',
                children: [
                    {
                        label: 'Terms of use',
                        key: 'terms'
                    },
                    {
                        label: 'Privacy Policy',
                        key: 'privacy'
                    },
                    {
                        label: 'Support',
                        key: 'support',
                        children: [
                            {
                                label: 'Help & Support',
                                key: 'help-and-support'
                            },
                            {
                                label: 'Guide',
                                key: 'guide'
                            },
                            {
                                label: 'Buying From Us',
                                key: 'buying-from-us'
                            },
                            {
                                label: 'Trust & Safety',
                                key: 'trust-and-safety'
                            }
                        ]
                    },
                    {
                        label: 'FAQ',
                        key: 'faq'
                    }
                ]
            }
        ]}/>
      </div>
    )
  }